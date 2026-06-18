import { useState } from "react";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import { ShoppingCart } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-h-svh bg-slate-50/50 text-slate-900">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <ShoppingCart className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">SIPO</p>
                <p className="text-xs text-muted-foreground">
                  Sistem Informasi Point of Sale
                </p>
              </div>
            </div>

            <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("products")}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "products"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Produk
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  activeTab === "categories"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
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