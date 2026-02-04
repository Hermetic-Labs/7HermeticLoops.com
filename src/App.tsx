import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { AuthorPage } from './pages/AuthorPage';
import { SuccessPage } from './pages/SuccessPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { LibraryPage } from './pages/LibraryPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { initParentMessageListener } from './lib/download-handler';

function App() {
  // Initialize parent message listener for iframe communication
  useEffect(() => {
    initParentMessageListener();
  }, []);
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-cyber-bg">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/author/:id" element={<AuthorPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/seller" element={<SellerDashboardPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
