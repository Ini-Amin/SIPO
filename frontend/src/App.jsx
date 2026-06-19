import { useState } from "react";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import { ShoppingCart } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-h-svh text-slate-100">
      <header className="border-b border-white/5 bg-slate-950/25 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-sm">
                <ShoppingCart className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-100">SIPO</p>
                <p className="text-xs text-slate-400">
                  Sistem Informasi Point of Sale
                </p>
              </div>
            </div>

            <nav className="flex gap-1 bg-white/5 border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "products"
                    ? "bg-white/10 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Produk
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "categories"
                    ? "bg-white/10 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Kategori
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {activeTab === "products" ? <Products /> : <Categories />}
        </div>
      </main>
    </div>
  );
}

export default App;