"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, User, Lock, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

const GiftExchangeApp = () => {
  const [step, setStep] = useState('login');
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [planA, setPlanA] = useState({ games: ['', ''], price: '' });
  const [planB, setPlanB] = useState({ games: ['', ''], price: '' });
  const [drawResult, setDrawResult] = useState(null);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  // 在組件加載時從 localStorage 讀取數據
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('無法讀取使用者數據', error);
      }
    };
  
    fetchUsers();
  }, []);

  const validatePrice = (price) => {
    const numPrice = Number(price);
    return numPrice >= 250 && numPrice <= 350;
  };

  const handleLogin = () => {
    if (!currentUser.trim()) {
      setError('請輸入暱稱');
      return;
    }
    setIsAdmin(currentUser === 'shiwei');
    setStep('plans');
    setError('');
  };

  const handlePlanSubmit = async () => {
    if (!planA.games[0] || !planA.games[1] || !planB.games[0] || !planB.games[1]) {
      setError('請填寫所有遊戲名稱');
      return;
    }
  
    if (!validatePrice(planA.price) || !validatePrice(planB.price)) {
      setError('價格必須在250-350之間');
      return;
    }
  
    const newUser = {
      id: currentUser,
      planA,
      planB,
      timestamp: new Date().toISOString()
    };
  
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
  
      if (!response.ok) {
        throw new Error('儲存數據失敗');
      }
  
      const updatedUsers = await response.json();
      setUsers(prev => [...prev.filter(user => user.id !== currentUser), newUser]);
      setError('');
      alert('方案提交成功！');
    } catch (error) {
      console.error('儲存數據時出錯', error);
      setError('儲存數據失敗');
    }
  };
  

  const performDraw = async () => {
    if (!isAdmin) return;
    
    if (users.length < 2) {
      setError('至少需要兩位參與者才能進行抽籤');
      return;
    }

    setIsDrawing(true);
    
    // 模擬抽獎動畫
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    const results = shuffledUsers.map((user, index) => ({
      giver: user.id,
      receiver: shuffledUsers[(index + 1) % shuffledUsers.length].id,
      plan: Math.random() > 0.5 ? 'A' : 'B'
    }));
    
    setDrawResult(results);
    setIsDrawing(false);

    // 儲存抽籤結果
    localStorage.setItem('giftExchangeResults', JSON.stringify(results));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 參與者列表組件
  const ParticipantsList = () => (
    <div className="mt-4 p-4 border-2 border-purple-200 rounded-lg">
      <h3 className="font-bold text-lg mb-2">當前參與者 ({users.length})</h3>
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={index} className="p-4 bg-purple-50 rounded shadow">
            <span className="font-medium text-purple-700">{user.id}</span>
            <span className="text-sm text-gray-500 ml-2">
              {new Date(user.timestamp).toLocaleString()}
            </span>
            <div className="mt-2">
              <h4 className="font-bold text-sm text-purple-600">方案 A:</h4>
              <ul className="text-sm text-gray-700 ml-4">
                <li>遊戲 1: {user.planA.games[0]}</li>
                <li>遊戲 2: {user.planA.games[1]}</li>
                <li>總價格: {user.planA.price}</li>
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="font-bold text-sm text-purple-600">方案 B:</h4>
              <ul className="text-sm text-gray-700 ml-4">
                <li>遊戲 1: {user.planB.games[0]}</li>
                <li>遊戲 2: {user.planB.games[1]}</li>
                <li>總價格: {user.planB.price}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div
              key="login"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-blue-600">
                    <User className="h-8 w-8" />
                    Steam 禮物交換
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <Input
                      placeholder="請輸入你的暱稱(識別用)"
                      value={currentUser}
                      onChange={(e) => setCurrentUser(e.target.value)}
                      className="pl-10 pr-4 py-2 border-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    進入系統 <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'plans' && (
            <motion.div
              key="plans"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-purple-600">
                    <Gift className="h-8 w-8" />
                    禮物方案設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {['A', 'B'].map((plan, index) => (
                    <motion.div
                      key={plan}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-xl flex items-center gap-2 text-purple-600">
                        <Sparkles className="h-5 w-5" />
                        方案 {plan}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder={`遊戲1`}
                          value={plan === 'A' ? planA.games[0] : planB.games[0]}
                          onChange={(e) => {
                            const setter = plan === 'A' ? setPlanA : setPlanB;
                            const current = plan === 'A' ? planA : planB;
                            setter({...current, games: [e.target.value, current.games[1]]});
                          }}
                          className="border-2 focus:ring-2 focus:ring-purple-500"
                        />
                        <Input
                          placeholder={`遊戲2`}
                          value={plan === 'A' ? planA.games[1] : planB.games[1]}
                          onChange={(e) => {
                            const setter = plan === 'A' ? setPlanA : setPlanB;
                            const current = plan === 'A' ? planA : planB;
                            setter({...current, games: [current.games[0], e.target.value]});
                          }}
                          className="border-2 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <Input
                        type="number"
                        placeholder="總價格 (250-350)"
                        value={plan === 'A' ? planA.price : planB.price}
                        onChange={(e) => {
                          const setter = plan === 'A' ? setPlanA : setPlanB;
                          const current = plan === 'A' ? planA : planB;
                          setter({...current, price: e.target.value});
                        }}
                        className="border-2 focus:ring-2 focus:ring-purple-500"
                      />
                    </motion.div>
                  ))}

                  <ParticipantsList />

                  <div className="space-y-4 pt-4">
                    <Button
                      onClick={handlePlanSubmit}
                      className="w-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                    >
                      提交方案 <Gift className="ml-2 h-4 w-4" />
                    </Button>

                    {isAdmin && (
                      <Button
                        onClick={() => setStep('draw')}
                        className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
                      >
                        進入抽籤 <Lock className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'draw' && isAdmin && (
            <motion.div
              key="draw"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-green-600">
                    <Lock className="h-8 w-8" />
                    抽獎系統
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    onClick={performDraw}
                    disabled={isDrawing}
                    className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    {isDrawing ? (
                      <>
                        <span className="animate-spin mr-2">⭐</span>
                        抽獎中...
                      </>
                    ) : (
                      <>開始抽籤 <Sparkles className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  <AnimatePresence>
                    {drawResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="font-bold text-xl text-green-600 flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          抽籤結果
                        </h3>
                        {drawResult.map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border-2 border-green-200 rounded-lg bg-green-50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{result.giver}</span>
                              <ChevronRight className="h-5 w-5 text-green-500" />
                              <span className="font-medium">{result.receiver}</span>
                              <span className="ml-4 px-2 py-1 bg-green-200 rounded-full text-sm">
                                方案{result.plan}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftExchangeApp;