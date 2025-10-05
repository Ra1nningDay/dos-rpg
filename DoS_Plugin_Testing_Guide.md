# คู่มือการทดสอบปลั๊กอิน DoS ทีละตัว

## 🧪 คำแนะนำในการทดสอบปลั๊กอิน

### คำตอบ: ควรใส่ทีละตัวและทดสอบก่อน!

เนื่องจากปลั๊กอินเหล่านี้มีการเชื่อมต่อกัน แต่แนะนำให้ทดสอบทีละตัวเพื่อ:

1. ตรวจสอบว่าแต่ละปลั๊กอินทำงานได้ถูกต้อง
2. หาส่วนที่ทำให้เกิดข้อผิดพลาดได้ง่าย
3. มั่นใจว่าระบบพื้นฐานทำงานได้ก่อนเชื่อมต่อกัน

## 📋 ลำดับการทดสอบที่แนะนำ

### ขั้นตอนที่ 1: ทดสอบปลั๊กอินพื้นฐานก่อน

#### 1.1 เริ่มต้นกับ DoS_DayCycle.js (ปลั๊กอินพื้นฐานที่สำคัญที่สุด)

```
✅ เพิ่มเฉพาะ DoS_DayCycle.js
✅ ตั้งค่าพารามิเตอร์:
   - MaxDays: 30
   - DayVariable: 1
   - PhaseVariable: 2
   - ShowDayInMenu: true
```

**การทดสอบ:**

1. สร้างอีเวนต์ทดสอบ:
   ```
   Plugin Command: ShowDayStatus
   Plugin Command: AdvanceDay
   Plugin Command: SetPhase 1
   ```
2. ตรวจสอบว่า:
   - เมนูแสดงข้อมูลวัน
   - ปลั๊กอินคอมมานด์ทำงาน
   - ไม่มีข้อความ error

#### 1.2 เพิ่ม DoS_StatusSystem.js

```
✅ เพิ่ม DoS_StatusSystem.js (อยู่ถัดจาก DoS_DayCycle)
✅ ตั้งค่าพารามิเตอร์:
   - FatigueVariable: 3
   - CorruptionVariable: 4
   - HopeVariable: 5
   - ShowInStatus: true
```

**การทดสอบ:**

1. สร้างอีเวนต์ทดสอบ:
   ```
   Plugin Command: ChangeFatigue 20
   Plugin Command: ChangeHope 10
   Plugin Command: ShowStatusWindow
   ```
2. ตรวจสอบว่า:
   - สถานะแสดงในหน้า Status
   - ค่าเปลี่ยนแปลงถูกต้อง
   - ไม่ซ้อนทับกับระบบวัน

### ขั้นตอนที่ 2: ทดสอบปลั๊กอินการโต้ตอบ

#### 2.1 เพิ่ม DoS_DialogueSystem.js

```
✅ เพิ่ม DoS_DialogueSystem.js
✅ ตั้งค่าพารามิเตอร์:
   - SisterRelationshipVariable: 6
   - NpcRelationshipVariable: 7
   - TowerDwellerRelationshipVariable: 8
```

**การทดสอบ:**

1. สร้างอีเวนต์ทดสอบ:
   ```
   Show Text: \CHOICE[เลือก A|hope:+5]\CHOICE[เลือก B|hope:-3]
   Plugin Command: ShowRelationshipStatus
   ```
2. ตรวจสอบว่า:
   - ตัวเลือกแสดงผล
   - สถานะเปลี่ยนหลังเลือก
   - ไม่ขัดกับระบบสถานะ

#### 2.2 เพิ่ม DoS_TimeSystem.js

```
✅ เพิ่ม DoS_TimeSystem.js
✅ ตั้งค่าพารามิเตอร์:
   - TimeVariable: 9
   - MaxTimePerDay: 10
```

**การทดสอบ:**

1. สร้างอีเวนต์ทดสอบ:
   ```
   Plugin Command: ConsumeTime 3
   Plugin Command: ShowTimeStatus
   ```
2. ตรวจสอบว่า:
   - เวลาลดลง
   - แสดงคำเตือนเมื่อเวลาน้อย
   - เชื่อมต่อกับระบบวันได้

### ขั้นตอนที่ 3: ทดสอบปลั๊กอินขั้นสูง

#### 3.1 เพิ่ม DoS_EchoMemory.js

```
✅ เพิ่ม DoS_EchoMemory.js
✅ ตั้งค่าพารามิเตอร์:
   - MemorySwitchBase: 10
   - ShowMemoryLogInMenu: true
```

**การทดสอบ:**

1. สร้างอีเวนต์ทดสอบ:
   ```
   Plugin Command: SetMemoryPortrait test_portrait
   Plugin Command: SetMemoryBackground test_bg
   Plugin Command: AddMemoryText "ทดสอบความทรงจำ"
   Plugin Command: UnlockMemory 1
   ```
2. ตรวจสอบว่า:
   - ฉากความทรงจำแสดง
   - Memory Log ปรากฏในเมนู
   - สวิตช์ทำงานถูกต้อง

### ขั้นตอนที่ 4: เพิ่มปลั๊กอินเชื่อมต่อขั้นสุดท้าย

#### 4.1 เพิ่ม DoS_CoreIntegration.js (ตัวสุดท้ายเสมอ!)

```
✅ เพิ่ม DoS_CoreIntegration.js
✅ ตั้งค่าพารามิเตอร์:
   - EnableDebugMode: true (สำหรับทดสอบ)
   - AutoSaveOnPhaseChange: true
```

**การทดสอบ:**

1. สร้างอีเวนต์ทดสอบ:
   ```
   Plugin Command: DoSDebug
   Plugin Command: DoSStatus
   Plugin Command: DoSSync
   ```
2. ตรวจสอบว่า:
   - ระบบทั้งหมดเชื่อมต่อกัน
   - Debug แสดงข้อมูล
   - ไม่มี conflict ระหว่างปลั๊กอิน

## 🚨 สัญญาณข้อผิดพลาดที่ต้องระวัง

### ถ้าเกิด error หลังเพิ่มปลั๊กอิน:

1. **ปิดปลั๊กอินล่าสุด** ทันที
2. **ตรวจสอบตัวแปร/สวิตช์** ซ้ำกันหรือไม่
3. **ตรวจสอบลำดับปลั๊กอิน** ถูกต้องหรือไม่
4. **เปิด Debug Mode** ใน DoS_CoreIntegration

### ปัญหาที่พบบ่อย:

- `Variable not defined` → ตัวแปรซ้ำกับระบบอื่น
- `Function not found` → ลำดับปลั๊กอินไม่ถูกต้อง
- `Cannot read property` → ปลั๊กอินอื่นที่จำเป็นยังไม่ถูกเพิ่ม

## 📝 แบบฟอร์มการทดสอบ

ใช้แบบฟอร์มนี้ในการบันทึกผลการทดสอบ:

| ปลั๊กอิน            | สถานะ | ปัญหาที่พบ | วิธีแก้ไข |
| ------------------- | ----- | ---------- | --------- |
| DoS_DayCycle        | ✅/❌ | -          | -         |
| DoS_StatusSystem    | ✅/❌ | -          | -         |
| DoS_DialogueSystem  | ✅/❌ | -          | -         |
| DoS_TimeSystem      | ✅/❌ | -          | -         |
| DoS_EchoMemory      | ✅/❌ | -          | -         |
| DoS_CoreIntegration | ✅/❌ | -          | -         |

## 🎯 ข้อสรุป

1. **ทดสอบทีละตัว** - แนะนำอย่างยิ่ง
2. **เริ่มจากพื้นฐาน** - DayCycle → Status → Dialogue → Time → Memory → Integration
3. **ตรวจสอบทีละขั้น** - แน่ใจว่าทำงานได้ก่อนเพิ่มตัวถัดไป
4. **ใช้ Debug Mode** - ช่วยหาส่วนที่ผิดพลาดได้ง่าย

เมื่อทุกปลั๊กอินทำงานได้ดีแยกกัน การเชื่อมต่อร่วมกันจะทำงานได้อย่างสมบูรณ์!
