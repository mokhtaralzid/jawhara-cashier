import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Trash2, Plus, Minus, Printer, Edit, X, Settings, Save, Bluetooth, Wifi } from 'lucide-react'
import './App.css'

function App() {
  // بيانات الأصناف الافتراضية
  const defaultCategories = {
    'عصائر': [
      { id: 1, name: 'عصير مانجو', price: 7, unit: 'كأس' },
      { id: 2, name: 'عصير برتقال', price: 6, unit: 'كأس' },
      { id: 3, name: 'عصير تفاح', price: 5, unit: 'كأس' },
      { id: 4, name: 'عصير فراولة', price: 8, unit: 'كأس' },
    ],
    'ساندويشات': [
      { id: 5, name: 'ساندويش بيض', price: 5, unit: 'صحة' },
      { id: 6, name: 'ساندويش جبنة', price: 4, unit: 'صحة' },
      { id: 7, name: 'ساندويش لحمة', price: 12, unit: 'صحة' },
      { id: 8, name: 'ساندويش دجاج', price: 10, unit: 'صحة' },
    ],
    'طاخة': [
      { id: 9, name: 'كبدة', price: 6, unit: 'نص' },
      { id: 10, name: 'كبدة', price: 12, unit: 'علبة' },
      { id: 11, name: 'فول مدمس', price: 4, unit: 'نص' },
      { id: 12, name: 'فول مدمس', price: 8, unit: 'علبة' },
      { id: 13, name: 'طعمية', price: 3, unit: 'نص' },
      { id: 14, name: 'طعمية', price: 6, unit: 'علبة' },
    ],
    'السعر': [
      { id: 15, name: 'وجبة مميزة', price: 15, unit: 'وجبة' },
      { id: 16, name: 'وجبة عادية', price: 10, unit: 'وجبة' },
      { id: 17, name: 'وجبة اقتصادية', price: 7, unit: 'وجبة' },
    ],
    'صحة': [
      { id: 18, name: 'سلطة خضراء', price: 5, unit: 'صحة' },
      { id: 19, name: 'سلطة فواكه', price: 8, unit: 'صحة' },
      { id: 20, name: 'سلطة يونانية', price: 12, unit: 'صحة' },
    ],
    'كأس': [
      { id: 21, name: 'شاي', price: 2, unit: 'كأس' },
      { id: 22, name: 'قهوة', price: 3, unit: 'كأس' },
      { id: 23, name: 'نسكافيه', price: 4, unit: 'كأس' },
      { id: 24, name: 'كابتشينو', price: 6, unit: 'كأس' },
    ]
  }

  // حالات التطبيق
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('pos-categories')
    return saved ? JSON.parse(saved) : defaultCategories
  })
  
  const [activeCategory, setActiveCategory] = useState('عصائر')
  const [cart, setCart] = useState([])
  const [showManageModal, setShowManageModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', price: '', unit: 'كأس', category: 'عصائر' })
  const [nextId, setNextId] = useState(() => {
    const allItems = Object.values(defaultCategories).flat()
    return Math.max(...allItems.map(item => item.id)) + 1
  })

  // حالات الطباعة عبر البلوتوث
  const [bluetoothDevice, setBluetoothDevice] = useState(null)
  const [bluetoothConnected, setBluetoothConnected] = useState(false)
  const [printStatus, setPrintStatus] = useState('')
  const [showBluetoothAlert, setShowBluetoothAlert] = useState(false)

  // حفظ البيانات في التخزين المحلي
  useEffect(() => {
    localStorage.setItem('pos-categories', JSON.stringify(categories))
  }, [categories])

  // إضافة صنف للفاتورة
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  // تحديث الكمية
  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
      }
      return item
    }).filter(Boolean))
  }

  // حذف صنف من الفاتورة
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  // حساب المجموع
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // إضافة صنف جديد
  const addNewItem = () => {
    if (!newItem.name || !newItem.price) return
    
    const item = {
      id: nextId,
      name: newItem.name,
      price: parseFloat(newItem.price),
      unit: newItem.unit
    }
    
    setCategories(prev => ({
      ...prev,
      [newItem.category]: [...(prev[newItem.category] || []), item]
    }))
    
    setNextId(nextId + 1)
    setNewItem({ name: '', price: '', unit: 'كأس', category: 'عصائر' })
    setShowItemModal(false)
  }

  // تعديل صنف
  const editItem = (item) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      unit: item.unit,
      category: activeCategory
    })
    setShowItemModal(true)
  }

  // حفظ التعديل
  const saveEditItem = () => {
    if (!newItem.name || !newItem.price) return
    
    setCategories(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map(item =>
        item.id === editingItem.id
          ? { ...item, name: newItem.name, price: parseFloat(newItem.price), unit: newItem.unit }
          : item
      )
    }))
    
    setEditingItem(null)
    setNewItem({ name: '', price: '', unit: 'كأس', category: 'عصائر' })
    setShowItemModal(false)
  }

  // حذف صنف
  const deleteItem = (itemId) => {
    setCategories(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(item => item.id !== itemId)
    }))
  }

  // إعادة تعيين البيانات
  const resetData = () => {
    setCategories(defaultCategories)
    localStorage.removeItem('pos-categories')
  }

  // الاتصال بطابعة البلوتوث
  const connectBluetooth = async () => {
    try {
      if (!navigator.bluetooth) {
        setShowBluetoothAlert(true)
        setPrintStatus('البلوتوث غير مدعوم في هذا المتصفح')
        return
      }

      setPrintStatus('جاري البحث عن الطابعات...')
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // طابعات حرارية
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'Receipt' }
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      })

      setPrintStatus('جاري الاتصال...')
      const server = await device.gatt.connect()
      
      setBluetoothDevice(device)
      setBluetoothConnected(true)
      setPrintStatus('تم الاتصال بالطابعة بنجاح')
      
      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => setPrintStatus(''), 3000)
      
    } catch (error) {
      console.error('خطأ في الاتصال بالبلوتوث:', error)
      setPrintStatus('فشل في الاتصال بالطابعة')
      setTimeout(() => setPrintStatus(''), 3000)
    }
  }

  // قطع الاتصال بالبلوتوث
  const disconnectBluetooth = () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect()
    }
    setBluetoothDevice(null)
    setBluetoothConnected(false)
    setPrintStatus('تم قطع الاتصال')
    setTimeout(() => setPrintStatus(''), 3000)
  }

  // تحويل النص إلى أوامر طباعة حرارية
  const createPrintData = () => {
    const ESC = '\x1B'
    const GS = '\x1D'
    
    let printData = ''
    
    // إعدادات الطباعة
    printData += ESC + '@' // إعادة تعيين الطابعة
    printData += ESC + 'a' + '\x01' // محاذاة وسط
    printData += GS + '!' + '\x11' // خط كبير
    
    // عنوان المطعم
    printData += 'مطعم الجوهرة\n'
    printData += '================\n'
    
    // معلومات الفاتورة
    printData += ESC + 'a' + '\x00' // محاذاة يسار
    printData += GS + '!' + '\x00' // خط عادي
    printData += `فاتورة رقم: ${Date.now()}\n`
    printData += `التاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`
    printData += `الوقت: ${new Date().toLocaleTimeString('ar-EG')}\n`
    printData += '--------------------------------\n'
    
    // عناصر الفاتورة
    cart.forEach(item => {
      printData += `${item.name} (${item.unit})\n`
      printData += `${item.quantity} x ${item.price} = ${item.price * item.quantity}\n`
      printData += '--------------------------------\n'
    })
    
    // المجموع
    printData += ESC + 'a' + '\x02' // محاذاة يمين
    printData += GS + '!' + '\x11' // خط كبير
    printData += `المجموع: ${total} جنيه\n`
    printData += '================================\n'
    
    // رسالة الشكر
    printData += ESC + 'a' + '\x01' // محاذاة وسط
    printData += GS + '!' + '\x00' // خط عادي
    printData += 'شكراً لزيارتكم\n'
    printData += 'نتطلع لخدمتكم مرة أخرى\n\n\n'
    
    // قطع الورق
    printData += GS + 'V' + '\x42' + '\x00'
    
    return new TextEncoder().encode(printData)
  }

  // طباعة عبر البلوتوث
  const printViaBluetooth = async () => {
    if (!bluetoothConnected || !bluetoothDevice) {
      setPrintStatus('يرجى الاتصال بالطابعة أولاً')
      setTimeout(() => setPrintStatus(''), 3000)
      return
    }

    try {
      setPrintStatus('جاري الطباعة...')
      
      const server = bluetoothDevice.gatt
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')
      
      const printData = createPrintData()
      await characteristic.writeValue(printData)
      
      setPrintStatus('تم الطباعة بنجاح')
      setTimeout(() => setPrintStatus(''), 3000)
      
    } catch (error) {
      console.error('خطأ في الطباعة:', error)
      setPrintStatus('فشل في الطباعة')
      setTimeout(() => setPrintStatus(''), 3000)
    }
  }

  // طباعة الفاتورة (عادية أو بلوتوث)
  const printInvoice = () => {
    if (bluetoothConnected) {
      printViaBluetooth()
    } else {
      // الطباعة العادية
      const printContent = `
        <div style="font-family: Arial; text-align: center; direction: rtl; max-width: 300px; margin: 0 auto;">
          <h2>مطعم الجوهرة</h2>
          <p>فاتورة رقم: ${Date.now()}</p>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
          <p>الوقت: ${new Date().toLocaleTimeString('ar-EG')}</p>
          <hr>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #000;">
              <th style="padding: 5px;">الصنف</th>
              <th style="padding: 5px;">الكمية</th>
              <th style="padding: 5px;">السعر</th>
              <th style="padding: 5px;">المجموع</th>
            </tr>
            ${cart.map(item => `
              <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 5px;">${item.name} (${item.unit})</td>
                <td style="padding: 5px; text-align: center;">${item.quantity}</td>
                <td style="padding: 5px; text-align: center;">${item.price}</td>
                <td style="padding: 5px; text-align: center;">${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </table>
          <hr>
          <h3>المجموع الكلي: ${total} جنيه</h3>
          <p>شكراً لزيارتكم</p>
          <p>نتطلع لخدمتكم مرة أخرى</p>
        </div>
      `
      
      const printWindow = window.open('', '_blank')
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* تنبيه البلوتوث */}
        {showBluetoothAlert && (
          <Alert className="mb-4 bg-yellow-100 border-yellow-400">
            <AlertDescription>
              البلوتوث غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Edge على الكمبيوتر أو الهاتف المحمول.
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowBluetoothAlert(false)}
              className="mt-2"
            >
              إغلاق
            </Button>
          </Alert>
        )}

        {/* رسالة حالة الطباعة */}
        {printStatus && (
          <Alert className="mb-4 bg-blue-100 border-blue-400">
            <AlertDescription>{printStatus}</AlertDescription>
          </Alert>
        )}

        {/* الشعار والعنوان */}
        <div className="text-center mb-6">
          <div className="bg-red-500 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <div className="text-white text-4xl font-bold">🍔</div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">الجوهرة</h1>
          <div className="flex justify-center gap-4 text-4xl mb-4">
            <span>🥤</span>
            <span>🍟</span>
            <span>🍔</span>
          </div>
          
          {/* أزرار التحكم */}
          <div className="flex justify-center gap-4 mb-4">
            {/* زر إدارة الأصناف */}
            <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
              <DialogTrigger asChild>
                <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold">
                  <Settings className="w-4 h-4 ml-2" />
                  إدارة الأصناف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">إدارة الأصناف</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* أزرار التحكم */}
                  <div className="flex gap-2 flex-wrap">
                    <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة صنف جديد
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">اسم الصنف</Label>
                            <Input
                              id="name"
                              value={newItem.name}
                              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                              placeholder="أدخل اسم الصنف"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="price">السعر</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newItem.price}
                              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                              placeholder="أدخل السعر"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="unit">الوحدة</Label>
                            <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="كأس">كأس</SelectItem>
                                <SelectItem value="صحة">صحة</SelectItem>
                                <SelectItem value="نص">نص</SelectItem>
                                <SelectItem value="علبة">علبة</SelectItem>
                                <SelectItem value="وجبة">وجبة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {!editingItem && (
                            <div>
                              <Label htmlFor="category">التصنيف</Label>
                              <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(categories).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={editingItem ? saveEditItem : addNewItem}
                              className="flex-1"
                            >
                              <Save className="w-4 h-4 ml-2" />
                              {editingItem ? 'حفظ التعديل' : 'إضافة'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowItemModal(false)
                                setEditingItem(null)
                                setNewItem({ name: '', price: '', unit: 'كأس', category: 'عصائر' })
                              }}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      onClick={resetData}
                    >
                      إعادة تعيين البيانات
                    </Button>
                  </div>
                  
                  {/* عرض الأصناف حسب التصنيف */}
                  <div className="space-y-6">
                    {Object.entries(categories).map(([categoryName, items]) => (
                      <div key={categoryName} className="border rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-3 text-red-600">{categoryName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-600">{item.price} ج - {item.unit}</div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveCategory(categoryName)
                                    editItem(item)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setActiveCategory(categoryName)
                                    deleteItem(item.id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* أزرار البلوتوث */}
            {!bluetoothConnected ? (
              <Button 
                onClick={connectBluetooth}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Bluetooth className="w-4 h-4 ml-2" />
                اتصال بلوتوث
              </Button>
            ) : (
              <Button 
                onClick={disconnectBluetooth}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
              >
                <X className="w-4 h-4 ml-2" />
                قطع الاتصال
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قسم التبويبات والأصناف */}
          <div className="lg:col-span-2">
            {/* التبويبات */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.keys(categories).map((category) => (
                <Button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`h-16 text-xl font-bold rounded-xl border-2 transition-all ${
                    activeCategory === category
                      ? 'bg-white text-red-600 border-white shadow-lg'
                      : 'bg-red-500 text-white border-red-400 hover:bg-red-400'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* الأصناف */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(categories[activeCategory] || []).map((item) => (
                <Card key={item.id} className="bg-white/95 hover:bg-white transition-all cursor-pointer shadow-lg hover:shadow-xl">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg mb-2 text-red-800">{item.name}</h3>
                    <Badge variant="secondary" className="mb-2">{item.unit}</Badge>
                    <p className="text-2xl font-bold text-red-600 mb-3">{item.price} ج</p>
                    <Button 
                      onClick={() => addToCart(item)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* قسم الفاتورة */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 shadow-2xl">
              <CardHeader className="bg-red-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  الفاتورة
                  {bluetoothConnected && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Bluetooth className="w-3 h-3 ml-1" />
                      متصل
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* جدول الفاتورة */}
                <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد أصناف في الفاتورة</p>
                  ) : (
                    <>
                      {/* رأس الجدول */}
                      <div className="grid grid-cols-4 gap-2 font-bold text-sm bg-red-100 p-2 rounded">
                        <div>الصنف</div>
                        <div className="text-center">الكمية</div>
                        <div className="text-center">السعر</div>
                        <div className="text-center">المجموع</div>
                      </div>
                      
                      {/* عناصر الفاتورة */}
                      {cart.map((item) => (
                        <div key={item.id} className="grid grid-cols-4 gap-2 items-center p-2 border-b">
                          <div className="text-sm">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">({item.unit})</div>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="mx-2 font-bold">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-center font-medium">{item.price}</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold">{item.price * item.quantity}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 p-0 ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* المجموع الكلي */}
                {cart.length > 0 && (
                  <>
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>المجموع الكلي:</span>
                        <span className="text-red-600">{total} جنيه</span>
                      </div>
                    </div>

                    {/* أزرار العمليات */}
                    <div className="space-y-2">
                      <Button 
                        onClick={printInvoice}
                        className={`w-full h-12 text-lg ${
                          bluetoothConnected 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        } text-white`}
                      >
                        {bluetoothConnected ? (
                          <>
                            <Bluetooth className="w-5 h-5 ml-2" />
                            طباعة بلوتوث
                          </>
                        ) : (
                          <>
                            <Printer className="w-5 h-5 ml-2" />
                            طباعة
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setCart([])}
                        variant="outline"
                        className="w-full h-10"
                      >
                        مسح الفاتورة
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

