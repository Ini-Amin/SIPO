import { useState, useEffect } from "react";
import { getTransactions, getTransactionById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ReceiptText, 
  Loader2, 
  Printer, 
  AlertTriangle,
  RotateCcw,
  Calendar,
  DollarSign
} from "lucide-react";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Receipt Modal state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Gagal mengambil daftar riwayat transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleOpenReceipt = async (transactionId) => {
    setIsReceiptOpen(true);
    setIsLoadingReceipt(true);
    setSelectedTransaction(null);
    try {
      const fullTransaction = await getTransactionById(transactionId);
      setSelectedTransaction(fullTransaction);
    } catch (error) {
      setErrorMessage(error.message || "Gagal memuat detail struk");
      setIsReceiptOpen(false);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedTransaction) return;

    const receiptHtml = document.getElementById("thermal-receipt-view").innerHTML;
    
    // Buat iframe tersembunyi untuk mencetak tanpa merusak state DOM React utama
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Cetak Struk SIPO - ${selectedTransaction.transaction_code}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 72mm;
              margin: 0 auto;
              padding: 10px 4px;
              color: #000;
              background-color: #fff;
              font-size: 11px;
              line-height: 1.2;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .item-row { margin-bottom: 5px; }
            .item-details { display: flex; justify-content: space-between; }
            .summary-table { width: 100%; margin-top: 5px; }
            .summary-table td { padding: 1px 0; }
            .footer-msg { margin-top: 15px; text-align: center; font-size: 9px; }
            @media print {
              body { width: 72mm; }
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => { window.frameElement.remove(); }, 500);">
          ${receiptHtml}
        </body>
      </html>
    `);
    doc.close();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Lihat daftar transaksi kasir, detail struk belanja, dan cetak ulang struk thermal.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadTransactions}
          disabled={isLoading}
          className="border-white/10 hover:bg-white/5 cursor-pointer text-slate-300"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 size-4" />
          )}
          Refresh Riwayat
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 flex gap-3 items-center">
          <AlertTriangle className="size-5 shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border-white/5 bg-slate-900/20 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="size-8 animate-spin text-cyan-400" />
              <p className="mt-3 text-sm">Memuat riwayat transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
              <ReceiptText className="size-12 stroke-[1.25] text-slate-600 mb-4" />
              <h3 className="font-semibold text-slate-300 text-sm">Belum ada transaksi</h3>
              <p className="text-xs text-slate-500 max-w-[280px] mt-1 mx-auto">
                Transaksi kasir yang diproses akan tercatat di sini secara otomatis.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/40 border-b border-white/5">
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-semibold w-[80px]">ID</TableHead>
                    <TableHead className="text-slate-400 font-semibold">Kode Transaksi</TableHead>
                    <TableHead className="text-slate-400 font-semibold">Tanggal & Waktu</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-right">Total Tagihan</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-right">Bayar</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-right">Kembalian</TableHead>
                    <TableHead className="text-slate-400 font-semibold text-center w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((trx) => (
                    <TableRow key={trx.id} className="border-b border-white/5 hover:bg-white/[0.02] text-slate-300">
                      <TableCell className="font-medium text-slate-400">{trx.id}</TableCell>
                      <TableCell className="font-semibold text-cyan-400">{trx.transaction_code}</TableCell>
                      <TableCell className="text-xs text-slate-400">{formatDate(trx.created_at)}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-200">
                        {rupiahFormatter.format(trx.total_price)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-400">
                        {rupiahFormatter.format(trx.amount_paid)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-green-400 font-medium">
                        {rupiahFormatter.format(trx.change_due)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleOpenReceipt(trx.id)}
                          className="border-white/10 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/20 text-xs px-2.5 py-1 cursor-pointer transition-all"
                        >
                          <ReceiptText className="mr-1.5 size-3.5" />
                          Lihat Struk
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECEIPTS DIALOG (MODAL STRUK THERMAL) */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-100 rounded-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ReceiptText className="size-5 text-cyan-400" />
              Struk Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Visualisasi struk printer thermal 80mm.
            </DialogDescription>
          </DialogHeader>

          {/* Thermal View Container */}
          <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl my-2 flex justify-center">
            {isLoadingReceipt ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="size-6 animate-spin text-cyan-400" />
                <p className="mt-2 text-xs">Memuat struk belanja...</p>
              </div>
            ) : selectedTransaction ? (
              /* The component designed inside is pure thermal invoice layout */
              <div 
                id="thermal-receipt-view" 
                className="w-full max-w-[280px] bg-white text-black p-4 font-mono text-[11px] shadow-md rounded-sm select-none"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <div className="text-center">
                  <h3 className="text-sm font-bold uppercase tracking-wide">SIPO POS STORE</h3>
                  <p className="text-[10px] text-zinc-600">Pusat Belanja POS Indonesia</p>
                  <p className="text-[9px] text-zinc-500">Telp: 021-99998888</p>
                </div>
                
                <div className="divider" style={{ borderTop: "1px dashed black", margin: "6px 0" }}></div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-zinc-600">
                    <span>No: {selectedTransaction.transaction_code}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-600">
                    <span>Tgl: {formatDate(selectedTransaction.created_at)}</span>
                  </div>
                </div>

                <div className="divider" style={{ borderTop: "1px dashed black", margin: "6px 0" }}></div>

                {/* Items loop */}
                <div className="space-y-2">
                  {selectedTransaction.items?.map((item) => (
                    <div key={item.id} className="item-row">
                      <div className="font-bold uppercase text-[10px] truncate max-w-[100%]">
                        {item.product_name}
                      </div>
                      <div className="item-details flex justify-between text-zinc-700 text-[10px]">
                        <span>{item.quantity} x {rupiahFormatter.format(item.price)}</span>
                        <span>{rupiahFormatter.format(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ borderTop: "1px dashed black", margin: "6px 0" }}></div>

                {/* Totals Summary */}
                <table className="summary-table w-full text-[10px]">
                  <tbody>
                    <tr>
                      <td className="text-zinc-600">Subtotal</td>
                      <td className="text-right">{rupiahFormatter.format(Math.round(selectedTransaction.total_price / 1.11))}</td>
                    </tr>
                    <tr>
                      <td className="text-zinc-600">PPN 11%</td>
                      <td className="text-right">{rupiahFormatter.format(selectedTransaction.total_price - Math.round(selectedTransaction.total_price / 1.11))}</td>
                    </tr>
                    <tr className="font-bold text-xs" style={{ borderTop: "1px dotted #000" }}>
                      <td style={{ paddingTop: "4px" }}>TOTAL</td>
                      <td className="text-right" style={{ paddingTop: "4px" }}>
                        {rupiahFormatter.format(selectedTransaction.total_price)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-zinc-600" style={{ paddingTop: "4px" }}>TUNAI</td>
                      <td className="text-right" style={{ paddingTop: "4px" }}>
                        {rupiahFormatter.format(selectedTransaction.amount_paid)}
                      </td>
                    </tr>
                    <tr className="font-bold">
                      <td>KEMBALIAN</td>
                      <td className="text-right">
                        {rupiahFormatter.format(selectedTransaction.change_due)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="divider" style={{ borderTop: "1px dashed black", margin: "6px 0" }}></div>

                <div className="footer-msg text-center mt-3 text-[9px] text-zinc-500">
                  <p className="font-bold uppercase">Terima Kasih</p>
                  <p>Atas Kunjungan & Belanja Anda</p>
                  <p>SIPO POS System v1.0</p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-slate-500 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Gagal memuat struk
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between gap-2 border-t border-white/5 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsReceiptOpen(false)}
              className="border-white/10 hover:bg-white/5 text-slate-300 font-semibold cursor-pointer rounded-xl flex-1 sm:flex-none"
            >
              Tutup
            </Button>
            <Button
              onClick={handlePrintReceipt}
              disabled={!selectedTransaction}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="size-4" />
              Cetak Struk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
