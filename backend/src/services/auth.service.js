const jwt = require('jsonwebtoken');
const { User, Wallet, Address, Referral, WalletTransaction, sequelize } = require('../models');
require('dotenv').config();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_123_dairy_farm', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async ({ name, email, password, phone, role, referredByCode }) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } }, { transaction });
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // 2. Check if phone is already registered
    const existingPhone = await User.findOne({ where: { phone } }, { transaction });
    if (existingPhone) {
      throw new Error('Phone number is already registered');
    }

    // 3. Resolve referred_by if referral code is provided
    let referredById = null;
    let referrer = null;
    if (referredByCode) {
      referrer = await User.findOne({ where: { referralCode: referredByCode } }, { transaction });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // 4. Create the User
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      referredById
    }, { transaction });

    // 5. Create Wallet for the user (Customers get ₹100 sign-up bonus, others ₹0)
    const signupBonus = (role === 'customer' || !role) ? 100.00 : 0.00;
    const wallet = await Wallet.create({
      userId: newUser.id,
      balance: signupBonus
    }, { transaction });

    if (signupBonus > 0) {
      await WalletTransaction.create({
        walletId: wallet.id,
        amount: signupBonus,
        transactionType: 'credit',
        description: 'Sign-up registration bonus',
        referenceId: newUser.id
      }, { transaction });
    }

    // 6. Handle Referral Rewards
    if (referrer && (role === 'customer' || !role)) {
      const rewardAmt = 50.00; // Reward ₹50

      // Create Referral log
      await Referral.create({
        referrerId: referrer.id,
        referredId: newUser.id,
        rewardAmount: rewardAmt,
        status: 'credited'
      }, { transaction });

      // Credit referrer wallet
      const referrerWallet = await Wallet.findOne({ where: { userId: referrer.id } }, { transaction });
      if (referrerWallet) {
        await referrerWallet.update({
          balance: parseFloat(referrerWallet.balance) + rewardAmt
        }, { transaction });

        await WalletTransaction.create({
          walletId: referrerWallet.id,
          amount: rewardAmt,
          transactionType: 'credit',
          description: `Referral bonus for inviting ${newUser.name}`,
          referenceId: newUser.id
        }, { transaction });
      }
    }

    await transaction.commit();

    const token = signToken(newUser.id);
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        referralCode: newUser.referralCode
      },
      token
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw new Error(`Your account status is ${user.status}. Please contact support.`);
  }

  const token = signToken(user.id);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode
    },
    token
  };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Address, as: 'addresses' },
      { model: Wallet, as: 'wallet' }
    ]
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const addAddress = async (userId, addressData) => {
  const { street, city, state, postalCode, addressType, isDefault } = addressData;

  if (isDefault) {
    // Set all other addresses for this user to default = false
    await Address.update({ isDefault: false }, { where: { userId } });
  }

  const address = await Address.create({
    userId,
    street,
    city,
    state,
    postalCode,
    addressType,
    isDefault: isDefault || false
  });

  return address;
};

const getAddresses = async (userId) => {
  return await Address.findAll({ where: { userId } });
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) {
    throw new Error('Address not found');
  }
  await address.destroy();
  return true;
};

module.exports = {
  register,
  login,
  getProfile,
  addAddress,
  getAddresses,
  deleteAddress
};
