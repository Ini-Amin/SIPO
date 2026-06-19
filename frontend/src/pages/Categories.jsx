import { useEffect, useState } from "react";
import { FolderPlus, Trash2, RefreshCw, AlertCircle, Inbox } from "lucide-react";
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
import { getCategories, createCategory, deleteCategory } from "@/lib/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [formData, setFormData] = useState({ name: "", description: "" });

  // Load categories from API
  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        const data = await getCategories();
        if (isActive) {
          setCategories(Array.isArray(data) ? data : []);
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

    loadCategories();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  function reloadCategories() {
    setIsLoading(true);
    setErrorMessage("");
    setReloadKey((current) => current + 1);
  }

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFormSuccess("");
  };

  // Submit Category to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Nama kategori wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      await createCategory({
        name: formData.name,
        description: formData.description,
      });

      setFormSuccess("Kategori berhasil ditambahkan!");
      setFormData({ name: "", description: "" });
      reloadCategories(); // refresh data
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Trigger Confirmation Dialog
  const triggerDeleteConfirm = (id, name) => {
    setCategoryToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  // Execute actual API deletion
  const executeDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      reloadCategories(); // refresh data
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      alert(`Gagal menghapus kategori: ${error.message}`);
    }
  };

  return (
    <div className="animate-in fade-in duration-200">
      {/* Header Halaman */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge
            variant="secondary"
            className="mb-3 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20"
          >
            Manajemen Kategori
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
            Daftar Kategori
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Kelompokkan produk SIPO untuk mempermudah pencarian dan pengorganisasian stok.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={reloadCategories}
          disabled={isLoading}
          className="border-white/10 hover:bg-white/5 text-slate-200"
        >
          <RefreshCw
            className={isLoading ? "animate-spin text-cyan-400" : "text-cyan-400"}
            data-icon="inline-start"
            aria-hidden="true"
          />
          Muat ulang
        </Button>
      </div>

      {/* Konten Utama (Grid 3 Kolom) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Kolom Kiri: Form Tambah Kategori */}
        <Card className="bg-card/50 backdrop-blur-md border border-white/5 md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
              <FolderPlus className="size-5 text-cyan-400" />
              Tambah Kategori
            </CardTitle>
            <CardDescription className="text-slate-400">
              Buat kategori baru untuk mengelompokkan produk Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Nama Kategori <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Makanan, Minuman"
                  className="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Penjelasan singkat mengenai kategori"
                  rows="3"
                  className="w-full rounded-lg border border-white/10 bg-white/5 text-slate-100 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>

              {formError && (
                <div className="rounded-lg bg-rose-950/30 border border-rose-500/20 p-2.5 text-xs text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/20 p-2.5 text-xs text-cyan-400">
                  <span>{formSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-slate-950 font-bold border-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Tabel Kategori */}
        <Card className="bg-card/50 backdrop-blur-md border border-white/5 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-100">Data Kategori</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="size-7 animate-spin text-cyan-400" />
                <p className="font-medium text-sm text-slate-300">Memuat data kategori...</p>
              </div>
            ) : errorMessage ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center px-4">
                <div className="rounded-full bg-rose-950/30 border border-rose-500/20 p-3 text-rose-400">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Gagal memuat kategori</p>
                  <p className="mt-1 text-sm text-slate-400">{errorMessage}</p>
                </div>
                <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5" onClick={reloadCategories}>Coba lagi</Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-white/5 p-3 text-slate-400">
                  <Inbox className="size-6" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Belum ada kategori</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Gunakan form di sebelah kiri untuk menambahkan kategori baru.
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="w-16 pl-4 sm:pl-6 text-slate-400">ID</TableHead>
                    <TableHead className="text-slate-400">Nama Kategori</TableHead>
                    <TableHead className="text-slate-400">Deskripsi</TableHead>
                    <TableHead className="w-20 pr-4 text-center sm:pr-6 text-slate-400">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-4 font-mono text-xs text-slate-400 sm:pl-6">
                        #{cat.id}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-200">
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm max-w-xs truncate">
                        {cat.description || <span className="text-slate-500 italic">Tidak ada deskripsi</span>}
                      </TableCell>
                      <TableCell className="pr-4 text-center sm:pr-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:bg-rose-950/30 hover:text-rose-400 rounded-lg text-slate-400 cursor-pointer"
                          onClick={() => triggerDeleteConfirm(cat.id, cat.name)}
                          title="Hapus Kategori"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Dialog Konfirmasi Hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border border-white/5 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus kategori <strong>"{categoryToDelete?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-slate-200"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              onClick={executeDelete}
            >
              Hapus Kategori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

}

export default Categories;
