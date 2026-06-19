import { useEffect, useState, useMemo } from "react";
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Boxes,
  Package,
  RefreshCw,
  TriangleAlert,
  Plus,
  Edit2,
  Trash2,
  Inbox
} from "lucide-react";

const LOW_STOCK_LIMIT = 5;
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", price: "", stock: "", category_id: "" });

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Load products and categories
  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        const [productData, categoryData] = await Promise.all([
          getProducts(),
          getCategories().catch(() => []) // Fallback in case categories API fails
        ]);

        if (isActive) {
          setProducts(Array.isArray(productData) ? productData : []);
          setCategories(Array.isArray(categoryData) ? categoryData : []);
          setErrorMessage("");
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const summary = useMemo(() => {
    return products.reduce(
      (result, product) => {
        result.totalStock += Number(product.stock || 0);

        if (Number(product.stock || 0) <= LOW_STOCK_LIMIT) {
          result.lowStock += 1;
        }

        return result;
      },
      {
        totalStock: 0,
        lowStock: 0,
      },
    );
  }, [products]);

  function reloadProducts() {
    setIsLoading(true);
    setErrorMessage("");
    setReloadKey((currentKey) => currentKey + 1);
  }

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  // Open Form Dialog
  const openFormDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id ? product.category_id.toString() : "",
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "", category_id: "" });
    }
    setFormError("");
    setIsFormOpen(true);
  };

  // Submit Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Nama produk wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: formData.category_id ? Number(formData.category_id) : null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setIsFormOpen(false);
      reloadProducts();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Delete Confirmation
  const triggerDeleteConfirm = (id, name) => {
    setProductToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  // Execute Deletion
  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      reloadProducts();
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      alert(`Gagal menghapus produk: ${error.message}`);
    }
  };

  return (
    <div className="animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge
            variant="secondary"
            className="mb-3 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20"
          >
            Manajemen Produk
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
            Daftar Produk
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Pantau harga dan ketersediaan stok produk yang tersimpan di backend SIPO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-slate-200"
            onClick={reloadProducts}
            disabled={isLoading}
          >
            <RefreshCw
              className={isLoading ? "animate-spin text-cyan-400" : "text-cyan-400"}
              data-icon="inline-start"
              aria-hidden="true"
            />
            Muat ulang
          </Button>

          <Button
            type="button"
            className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-slate-950 font-bold border-none"
            onClick={() => openFormDialog()}
          >
            <Plus className="size-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {!isLoading && !errorMessage && products.length > 0 && (
        <section
          className="mb-6 grid gap-4 sm:grid-cols-3"
          aria-label="Ringkasan produk"
        >
          <SummaryCard
            title="Total Produk"
            value={products.length}
            description="Jenis produk terdaftar"
            icon={Package}
          />
          <SummaryCard
            title="Total Stok"
            value={summary.totalStock}
            description="Unit tersedia saat ini"
            icon={Boxes}
          />
          <SummaryCard
            title="Stok Rendah"
            value={summary.lowStock}
            description={`Stok ${LOW_STOCK_LIMIT} unit atau kurang`}
            icon={TriangleAlert}
            warning={summary.lowStock > 0}
          />
        </section>
      )}

      {isLoading && <LoadingState />}

      {!isLoading && errorMessage && (
        <ErrorState message={errorMessage} onRetry={reloadProducts} />
      )}

      {!isLoading && !errorMessage && products.length === 0 && (
        <EmptyState onReload={reloadProducts} />
      )}

      {!isLoading && !errorMessage && products.length > 0 && (
        <ProductTable 
          products={products} 
          categories={categories}
          onEdit={openFormDialog}
          onDelete={triggerDeleteConfirm}
        />
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-card border border-white/5 text-slate-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingProduct ? "Edit Data Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingProduct ? "Perbarui informasi detail produk." : "Tambahkan produk baru ke dalam data SIPO."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Nama Produk <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Contoh: Mouse Wireless, Keyboard"
                className="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Kategori <span className="text-slate-500">(Opsional)</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/10 bg-[#0b1220] text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Harga (Rp) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Stok <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  min="0"
                  required
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-rose-950/30 border border-rose-500/20 p-2.5 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <DialogFooter className="mt-6 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:bg-white/5 text-slate-200"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-slate-950 font-bold border-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border border-white/5 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus produk <strong>"{productToDelete?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-slate-200"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              onClick={executeDelete}
            >
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  warning = false,
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-md border border-white/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <div
          className={
            warning
              ? "rounded-lg bg-rose-950/30 border border-rose-500/20 p-2 text-rose-400"
              : "rounded-lg bg-cyan-950/30 border border-cyan-500/20 p-2 text-cyan-400"
          }
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-slate-100">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProductTable({ products, categories, onEdit, onDelete }) {
  return (
    <Card className="bg-card/50 backdrop-blur-md border border-white/5">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-slate-100">Data Produk</CardTitle>
        <CardDescription className="text-slate-400">
          Data ini diambil langsung dari endpoint{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-cyan-400">
            /api/products
          </code>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-16 pl-4 sm:pl-6 text-slate-400">ID</TableHead>
              <TableHead className="text-slate-400">Nama Produk</TableHead>
              <TableHead className="text-slate-400">Kategori</TableHead>
              <TableHead className="text-slate-400">Harga</TableHead>
              <TableHead className="text-right text-slate-400">Stok</TableHead>
              <TableHead className="text-center text-slate-400">Status</TableHead>
              <TableHead className="pr-4 text-center sm:pr-6 text-slate-400 w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLowStock = Number(product.stock || 0) <= LOW_STOCK_LIMIT;
              const categoryObj = categories.find(c => c.id === product.category_id);

              return (
                <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="pl-4 font-mono text-xs text-slate-400 sm:pl-6">
                    #{product.id}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-200">{product.name}</TableCell>
                  <TableCell className="text-slate-300">
                    {categoryObj ? categoryObj.name : <span className="text-slate-500 italic">Tanpa Kategori</span>}
                  </TableCell>
                  <TableCell className="text-slate-200">{rupiahFormatter.format(product.price)}</TableCell>
                  <TableCell className="text-right font-medium text-slate-200">{product.stock}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={isLowStock ? "destructive" : "secondary"}
                      className={isLowStock ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" : "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20"}
                    >
                      {isLowStock ? "Stok rendah" : "Tersedia"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-center sm:pr-6">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                        onClick={() => onEdit(product)}
                        title="Edit Produk"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-rose-950/30 hover:text-rose-400 rounded-lg text-slate-400 cursor-pointer"
                        onClick={() => onDelete(product.id, product.name)}
                        title="Hapus Produk"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="bg-card/50 backdrop-blur-md border border-white/5">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <RefreshCw
          className="size-7 animate-spin text-cyan-400"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-slate-200">Memuat data produk</p>
          <p className="mt-1 text-sm text-slate-400">
            Menghubungi backend SIPO...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <Card className="border-rose-950/30 bg-card/50 backdrop-blur-md border border-rose-500/20">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-rose-950/30 border border-rose-500/20 p-3 text-rose-400">
          <AlertCircle className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-slate-200">Data produk gagal dimuat</p>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            {message}
          </p>
        </div>
        <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5 text-slate-200" onClick={onRetry}>
          Coba lagi
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onReload }) {
  return (
    <Card className="bg-card/50 backdrop-blur-md border border-white/5">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-white/5 p-3 text-slate-400">
          <Package className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-slate-200">Belum ada produk</p>
          <p className="mt-1 text-sm text-slate-400">
            Produk yang ditambahkan melalui API akan tampil di sini.
          </p>
        </div>
        <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5 text-slate-200" onClick={onReload}>
          Muat ulang
        </Button>
      </CardContent>
    </Card>
  );
}

export default Products;
