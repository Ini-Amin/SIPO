import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  Package,
  RefreshCw,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { getProducts } from "@/lib/api";

const LOW_STOCK_LIMIT = 5;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      try {
        const productData = await getProducts();

        if (isActive) {
          setProducts(Array.isArray(productData) ? productData : []);
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

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const summary = useMemo(() => {
    return products.reduce(
      (result, product) => {
        result.totalStock += product.stock;

        if (product.stock <= LOW_STOCK_LIMIT) {
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

  return (
    <main className="min-h-svh">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
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
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge
              variant="secondary"
              className="mb-3 bg-emerald-100 text-emerald-800"
            >
              Manajemen Produk
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              Daftar Produk
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau harga dan ketersediaan stok produk yang tersimpan di
              backend SIPO.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={reloadProducts}
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
          <ProductTable products={products} />
        )}
      </div>
    </main>
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
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <CardAction
          className={
            warning
              ? "rounded-lg bg-amber-100 p-2 text-amber-700"
              : "rounded-lg bg-emerald-50 p-2 text-emerald-700"
          }
        >
          <Icon className="size-4" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProductTable({ products }) {
  return (
    <Card className="bg-white">
      <CardHeader className="border-b">
        <CardTitle>Data Produk</CardTitle>
        <CardDescription>
          Data ini diambil langsung dari endpoint{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            /api/products
          </code>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 pl-4 sm:pl-6">ID</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="pr-4 text-right sm:pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLowStock = product.stock <= LOW_STOCK_LIMIT;

              return (
                <TableRow key={product.id}>
                  <TableCell className="pl-4 font-mono text-xs text-muted-foreground sm:pl-6">
                    #{product.id}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{rupiahFormatter.format(product.price)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="pr-4 text-right sm:pr-6">
                    <Badge variant={isLowStock ? "destructive" : "secondary"}>
                      {isLowStock ? "Stok rendah" : "Tersedia"}
                    </Badge>
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
    <Card className="bg-white">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <RefreshCw
          className="size-7 animate-spin text-emerald-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium">Memuat data produk</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Menghubungi backend SIPO...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <Card className="border-red-200 bg-white">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-50 p-3 text-red-600">
          <AlertCircle className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium">Data produk gagal dimuat</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <Button type="button" onClick={onRetry}>
          Coba lagi
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onReload }) {
  return (
    <Card className="bg-white">
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-slate-100 p-3 text-slate-600">
          <Package className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium">Belum ada produk</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Produk yang ditambahkan melalui API akan tampil di sini.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onReload}>
          Muat ulang
        </Button>
      </CardContent>
    </Card>
  );
}

export default Products;
