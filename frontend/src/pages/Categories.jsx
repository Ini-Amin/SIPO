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
            className="mb-3 bg-emerald-100 text-emerald-800"
          >
            Manajemen Kategori
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Daftar Kategori
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Kelompokkan produk SIPO untuk mempermudah pencarian dan pengorganisasian stok.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={reloadCategories}
          disabled={isLoading}
        >
          <RefreshCw
            className={isLoading ? "animate-spin" : ""}
            data-icon="inline-start"
            aria-hidden="true"
          />
          Muat ulang
        </Button>
      </div>

      {/* Konten Utama (Grid 3 Kolom) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Kolom Kiri: Form Tambah Kategori */}
        <Card className="bg-white md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderPlus className="size-5 text-emerald-600" />
              Tambah Kategori
            </CardTitle>
            <CardDescription>
              Buat kategori baru untuk mengelompokkan produk Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Makanan, Minuman"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Penjelasan singkat mengenai kategori"
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700">
                  <span>{formSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Tabel Kategori */}
        <Card className="bg-white md:col-span-2">
          <CardHeader>
            <CardTitle>Data Kategori</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="size-7 animate-spin text-emerald-600" />
                <p className="font-medium text-sm">Memuat data kategori...</p>
              </div>
            ) : errorMessage ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center px-4">
                <div className="rounded-full bg-red-50 p-3 text-red-600">
                  <AlertCircle className="size-6" />
                </div>
                <div>
                  <p className="font-medium">Gagal memuat kategori</p>
                  <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
                </div>
                <Button type="button" onClick={reloadCategories}>Coba lagi</Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                  <Inbox className="size-6" />
                </div>
                <div>
                  <p className="font-medium">Belum ada kategori</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gunakan form di sebelah kiri untuk menambahkan kategori baru.
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 pl-4 sm:pl-6">ID</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="w-20 pr-4 text-center sm:pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="pl-4 font-mono text-xs text-muted-foreground sm:pl-6">
                        #{cat.id}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm max-w-xs truncate">
                        {cat.description || <span className="text-slate-400 italic">Tidak ada deskripsi</span>}
                      </TableCell>
                      <TableCell className="pr-4 text-center sm:pr-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 cursor-pointer"
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
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori <strong>"{categoryToDelete?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
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
