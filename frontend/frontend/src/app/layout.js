import './globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'GreenMeadow Dairy - Organic Farm Fresh Delivery',
  description: 'Subscribe to pure cow milk, fresh ghee, soft paneer, and butter. Morning farm-to-table delivery with automated wallet billing.',
  keywords: 'dairy farm, organic milk subscription, cow milk delivery, fresh paneer, butter online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
