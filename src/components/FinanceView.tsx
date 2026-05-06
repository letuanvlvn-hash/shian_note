import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  Wallet,
  Calendar,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { googleSheetsService } from '../services/googleSheetsService';

interface FinanceViewProps {
  transactions: any[];
  onSync: (transactions: any[]) => Promise<void>;
}

export default function FinanceView({ transactions, onSync }: FinanceViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTx, setNewTx] = useState({
    title: '',
    amount: '',
    category: 'Chi tiêu',
    type: 'expense'
  });

  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 128500000); // Base balance + transactions
  const monthlyIncome = transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + curr.amount, 0));

  const addTransaction = async () => {
    if (!newTx.title || !newTx.amount) {
      alert("Vui lòng nhập đầy đủ tên và số tiền giao dịch.");
      return;
    }
    
    const amountNum = parseFloat(newTx.amount);
    if (isNaN(amountNum)) {
      alert("Số tiền không hợp lệ.");
      return;
    }

    setIsSaving(true);
    
    try {
      const amount = amountNum * (newTx.type === 'expense' ? -1 : 1);
      const tx = {
        id: Date.now().toString(),
        title: newTx.title,
        amount,
        date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }),
        category: newTx.category || 'Khác',
        status: 'paid'
      };
      
      const newTransactions = [tx, ...transactions];
      await onSync(newTransactions);
      setIsDialogOpen(false);
      setNewTx({ title: '', amount: '', category: 'Chi tiêu', type: 'expense' });
    } catch (error) {
      console.error("Add transaction failed:", error);
      alert("Có lỗi xảy ra khi lưu giao dịch. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    await onSync(newTransactions);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Tài chính & Thanh toán</h2>
          <p className="text-muted-foreground">Theo dõi ngân sách và các khoản chi tiêu cá nhân.</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <Plus size={18} /> Giao dịch mới
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-none luxury-shadow bg-gradient-to-br from-white/10 to-transparent">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-white/5 text-primary">
                <Wallet size={20} />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-none">+12%</Badge>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tổng số dư</p>
              <p className="text-3xl font-bold">{totalBalance.toLocaleString('vi-VN')}đ</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none luxury-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-white/5 text-blue-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Thu nhập tháng này</p>
              <p className="text-3xl font-bold">{monthlyIncome.toLocaleString('vi-VN')}đ</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none luxury-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-white/5 text-orange-400">
                <Calendar size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Chi tiêu tháng này</p>
              <p className="text-3xl font-bold">{monthlyExpense.toLocaleString('vi-VN')}đ</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-none luxury-shadow overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
          <CardTitle className="text-lg font-medium">Giao dịch gần đây</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-48">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input placeholder="Tìm kiếm..." className="h-8 pl-8 bg-white/5 border-white/10 text-xs" />
            </div>
            <Button variant="outline" size="sm" className="h-8 border-white/10 gap-1 text-xs">
              <Filter size={14} /> Lọc
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-white/5">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{tx.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tx.date}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('vi-VN')}đ
                      </p>
                      <Badge variant="ghost" className={`text-[10px] p-0 h-auto ${tx.status === 'paid' ? 'text-green-400' : 'text-orange-400'}`}>
                        {tx.status === 'paid' ? 'Đã hoàn tất' : 'Đang chờ'}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id); }}
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white luxury-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Giao dịch mới</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tên giao dịch</label>
              <Input 
                value={newTx.title}
                onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
                placeholder="Ví dụ: Mua sắm, Tiền lương..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Số tiền (VNĐ)</label>
                <Input 
                  type="number"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  placeholder="500000"
                  className="bg-white/[0.02] border-white/5 focus:border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Loại</label>
                <div className="flex gap-2">
                  <Button 
                    variant={newTx.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                    className="flex-1 h-10 text-xs"
                  >
                    Chi tiêu
                  </Button>
                  <Button 
                    variant={newTx.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setNewTx({ ...newTx, type: 'income' })}
                    className="flex-1 h-10 text-xs"
                  >
                    Thu nhập
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Danh mục</label>
              <Input 
                value={newTx.category}
                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                placeholder="Ví dụ: Ăn uống, Giải trí..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Hủy</Button>
            <Button onClick={addTransaction} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200">
              {isSaving ? 'Đang lưu...' : 'Lưu giao dịch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
