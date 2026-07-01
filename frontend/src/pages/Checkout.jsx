import { useState, useEffect, useMemo } from "react";
import { getProducts, getCategories, createTransaction } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  RotateCcw
} from "lucide-react";

const LOW_STOCK_LIMIT = 5;
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function Checkout() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Cart states
  const [cart, setCart] = useState([]);
  const [amountPaid, setAmountPaid] = useState("");
  
  // Submission & Success Modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState(null);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [productData, categoryData] = await Promise.all([
        getProducts(),
        getCategories().catch(() => [])
      ]);
      setProducts(Array.isArray(productData) ? productData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      setErrorMessage(error.message || "Gagal memuat data POS");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || String(product.category_id) === String(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Map category to category names
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});
  }, [categories]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    return Math.round(cartSubtotal * 0.11); // PPN 11%
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + taxAmount;
  }, [cartSubtotal, taxAmount]);

  const changeDue = useMemo(() => {
    const paid = Number(amountPaid);
    if (!paid || paid < cartTotal) return 0;
    return paid - cartTotal;
  }, [amountPaid, cartTotal]);

  const isPaidEnough = useMemo(() => {
    const paid = Number(amountPaid);
    return paid >= cartTotal;
  }, [amountPaid, cartTotal]);

  // Cart Action Handlers
  const addToCart = (product) => {
    // Find current stock available taking into account item count already in cart
    const itemInCart = cart.find((item) => item.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    
    if (quantityInCart >= product.stock) {
      return; // Do not add if stock limit reached
    }

    if (itemInCart) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const decreaseQuantity = (productId) => {
    const itemInCart = cart.find((item) => item.id === productId);
    if (!itemInCart) return;

    if (itemInCart.quantity === 1) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const increaseQuantity = (productId) => {
    const itemInCart = cart.find((item) => item.id === productId);
    const originalProduct = products.find((p) => p.id === productId);
    
    if (!itemInCart || !originalProduct) return;
    if (itemInCart.quantity >= originalProduct.stock) return; // Limit by original stock

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Submit transaction to API
  const handleCheckout = async () => {
    if (cart.length === 0 || !isPaidEnough || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      amount_paid: Number(amountPaid),
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const data = await createTransaction(payload);
      setLatestTransaction(data);
      
      // Success flow
      setCart([]);
      setAmountPaid("");
      setIsSuccessOpen(true);
      
      // Refresh products to get updated stock
      await loadData();
    } catch (err) {
      setSubmitError(err.message || "Gagal memproses transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find remaining stock of a product considering current cart quantities
  const getAvailableStock = (product) => {
    const itemInCart = cart.find((item) => item.id === product.id);
    return itemInCart ? product.stock - itemInCart.quantity : product.stock;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Kasir POS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola transaksi dan entri pesanan pelanggan di sini.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadData}
          disabled={isLoading}
          className="border-white/10 hover:bg-white/5 cursor-pointer text-slate-300"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 size-4" />
          )}
          Refresh Data
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 flex gap-3 items-center">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Gagal memuat data POS</p>
            <p className="text-xs text-red-400/80">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Product Catalog (7/12 width on LG) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SEARCH & FILTERS BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl">
            <div className="relative sm:col-span-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
            
            <div className="relative sm:col-span-4 flex items-center">
              <Filter className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all appearance-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRODUCT CARDS CATALOG GRID */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 rounded-2xl">
              <Loader2 className="size-8 animate-spin text-cyan-400" />
              <p className="mt-3 text-sm text-slate-400">Memuat produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 rounded-2xl text-slate-500">
              <ShoppingCart className="size-12 stroke-[1.5]" />
              <p className="mt-4 text-sm font-medium">Tidak ada produk ditemukan</p>
              <p className="text-xs text-slate-600">Sesuaikan kriteria pencarian atau filter kategori Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const availableStock = getAvailableStock(product);
                const isOutOfStock = availableStock <= 0;
                const isLowStock = availableStock > 0 && availableStock <= LOW_STOCK_LIMIT;
                
                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`group relative flex flex-col justify-between border bg-slate-900/30 backdrop-blur-sm rounded-2xl p-4 transition-all duration-200 select-none ${
                      isOutOfStock
                        ? "border-white/5 opacity-50 cursor-not-allowed"
                        : "border-white/5 hover:border-cyan-500/40 hover:bg-slate-900/55 cursor-pointer shadow-sm hover:shadow-cyan-950/20"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-medium text-cyan-400">
                          {categoryMap[product.category_id] || "Tanpa Kategori"}
                        </span>
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0.5">
                            Habis
                          </Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0.5">
                            Sisa {availableStock}
                          </Badge>
                        ) : null}
                      </div>

                      <h3 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Harga</span>
                        <span className="text-sm font-bold text-slate-100">
                          {rupiahFormatter.format(product.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 bg-white/5 border border-white/5 rounded-md px-1.5 py-0.5">
                        Stok: {availableStock}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Shoppping Cart & Checkout (5/12 width on LG) */}
        <div className="lg:col-span-5">
          <Card className="border-white/5 bg-slate-900/20 backdrop-blur-sm rounded-2xl overflow-hidden sticky top-[92px]">
            <CardHeader className="border-b border-white/5 bg-slate-950/40 px-4 py-3.5">
              <CardTitle className="text-base flex items-center justify-between font-semibold text-slate-200">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="size-4 text-cyan-400" />
                  Keranjang Belanja
                </span>
                <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)} item
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* CART ITEMS LIST */}
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 px-4 text-center">
                  <ShoppingCart className="size-10 stroke-[1.25] text-slate-600 animate-pulse" />
                  <p className="mt-3 text-sm font-medium">Keranjang masih kosong</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-[250px]">
                    Klik pada kartu produk di sebelah kiri untuk memasukkannya ke dalam struk belanja.
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 hover:bg-white/[0.02] transition-all">
                        <div className="space-y-0.5 pr-2 max-w-[55%]">
                          <h4 className="text-xs font-semibold text-slate-200 truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {rupiahFormatter.format(item.price)} x {item.quantity}
                          </p>
                        </div>

                        {/* Cart Item Quantity Controls & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-white/10 rounded-lg p-0.5">
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="size-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer transition-all"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-semibold text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="size-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer transition-all"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="size-8 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-red-500/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PRICE SUMMARY PANEL */}
                  <div className="bg-slate-950/40 p-4 border-t border-white/5 space-y-2.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-200">{rupiahFormatter.format(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN 11%</span>
                      <span className="font-medium text-slate-200">{rupiahFormatter.format(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2.5 text-sm font-semibold text-slate-100">
                      <span className="text-cyan-400">Total Akhir</span>
                      <span className="text-cyan-400 text-base">{rupiahFormatter.format(cartTotal)}</span>
                    </div>
                  </div>

                  {/* CASH PAYMENT FIELD */}
                  <div className="p-4 border-t border-white/5 bg-slate-900/40 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Uang Pembayaran Kasir (Rp)
                      </label>
                      <input
                        type="number"
                        placeholder="Masukkan nominal uang bayar..."
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-semibold"
                        min="0"
                      />
                    </div>

                    {/* Calculated Change Block */}
                    {amountPaid && (
                      <div className="flex justify-between items-center text-xs font-medium py-1">
                        <span>Uang Kembalian:</span>
                        {isPaidEnough ? (
                          <span className="text-sm font-bold text-green-400">
                            {rupiahFormatter.format(changeDue)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                            <AlertTriangle className="size-3" />
                            Uang bayar kurang!
                          </span>
                        )}
                      </div>
                    )}

                    {submitError && (
                      <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg flex items-start gap-1.5">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* PROCESS BUTTON */}
                    <Button
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || !amountPaid || !isPaidEnough || isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold py-2.5 rounded-xl hover:from-cyan-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Memproses Transaksi...
                        </>
                      ) : (
                        <>
                          <Receipt className="size-4" />
                          Proses Transaksi
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TRANSACTION SUCCESS MODAL */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-100 rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <div className="size-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="size-7" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-100">
              Transaksi Berhasil!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Transaksi kasir telah sukses disimpan ke database dan stok telah diperbarui.
            </DialogDescription>
          </DialogHeader>

          {latestTransaction && (
            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-xs space-y-3 my-2 font-mono text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Kode Transaksi</span>
                <span className="font-bold text-cyan-400">{latestTransaction.transaction_code}</span>
              </div>
              <div className="space-y-1 pb-2 border-b border-white/5">
                <p className="text-slate-500 text-[10px] uppercase font-sans font-semibold tracking-wider">Item dibeli:</p>
                {latestTransaction.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[70%]">{item.product_name} (x{item.quantity})</span>
                    <span>{rupiahFormatter.format(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Harga</span>
                  <span className="font-semibold text-slate-200">
                    {rupiahFormatter.format(latestTransaction.total_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Dibayar</span>
                  <span className="font-semibold text-slate-200">
                    {rupiahFormatter.format(latestTransaction.amount_paid)}
                  </span>
                </div>
                <div className="flex justify-between text-green-400 border-t border-white/5 pt-1.5 font-bold">
                  <span>Kembalian</span>
                  <span>{rupiahFormatter.format(latestTransaction.change_due)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setIsSuccessOpen(false)}
              className="bg-white/10 hover:bg-white/15 text-slate-200 hover:text-slate-100 font-semibold border border-white/5 rounded-xl px-6 cursor-pointer"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
