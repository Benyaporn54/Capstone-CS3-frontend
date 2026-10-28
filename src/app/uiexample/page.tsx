'use client';

import React, { useState } from 'react';
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import TextField from "@/components/ui/TextField";
import Dropdown from "@/components/ui/Dropdown";
import StarRating from "@/components/ui/StarRating";
import Checkbox from "@/components/ui/Checkbox";
import RadioButton from "@/components/ui/RadioButton";
import Switch from "@/components/ui/Switch";
import { Modal, ModalType } from "@/components/ui/Modal";

function UiExamplePage() {
  // State สำหรับ Radio Button (รูปแบบการเรียน)
  const [learningMode, setLearningMode] = useState<'onsite' | 'online'>('onsite');

  // State สำหรับ Modal และการปิด Modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    description: string;
    showCancel?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    description: '',
  });

  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  return (
    <div className="font-sans antialiased p-8 space-y-12 max-w-6xl mx-auto bg-bg text-fg">
      <header className="border-b border-border pb-4">
        <h1 className="text-h1 font-bold">UI Component Showcase</h1>
        <p className="text-body text-fg-muted mt-1">หน้าตรวจสอบและทดสอบการทำงานของ Component ทั้งหมดในระบบ Design System</p>
      </header>

      {/* Part 1: Buttons */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold border-l-4 border-accent pl-3">1. Button Component</h2>
        <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-lg bg-surface">
          <Button variant="primary">+ เพิ่มเข้าแผน</Button>
          <Button variant="primary" disabled>บันทึก (Disabled)</Button>
          <Button variant="secondary">เขียนรีวิว</Button>
          <Button variant="danger-light">ลบออกจากแผน</Button>
          <Button variant="ghost">ยกเลิก</Button>
        </div>
      </section>

      {/* Part 2: Text Inputs & Textarea */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold border-l-4 border-accent pl-3">2. Text Inputs & Area</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border rounded-lg bg-surface">
          <TextField
            label="ชื่อที่ใช้แสดง"
            helperText="default ชื่อนี้จะแสดงแทนชื่อจริงในรีวิว"
            placeholder="เช่น นักศึกษาปี 3"
          />
          <TextField
            label="รีวิว"
            isError={true}
            errorMessage="กรุณากรอกข้อมูลให้ครบถ้วน"
          />
          <TextField
            label="อีเมลคณะ"
            helperText="disabled"
            disabled
            placeholder="เช่น example@university.edu"
          />
          <TextField
            label="ค้นหารายวิชา"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
            placeholder="เช่น วิชาเลือกเสรี"
          />
          <div className="md:col-span-2">
            <TextArea
              label="เล่าประสบการณ์ที่เรียนวิชานี้"
              helperText="กรุณากรอกข้อมูลให้ครบถ้วน"
              placeholder="เนื้อหาเป็นยังไง งานเยอะมั้ย สอบแบบไหน"
            />
          </div>
        </div>
      </section>

      {/* Part 3: Selection Controls (Dropdown, Rating, Checkbox, Radio, Switch) */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold border-l-4 border-accent pl-3">3. Selection Controls & Rating</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border rounded-lg bg-surface">
          <Dropdown
            placeholder="เลือกหมวดวิชา"
            label="หมวดวิชา"
            options={[
              { label: "ทั้งหมด", value: "all" },
              { label: "กลุ่มวิชาแกน", value: "core" },
            ]}
          />
          <StarRating
            label="ให้คะแนนวิชา"
            maxStars={5}
            defaultValue={3}
            onChange={(value) => console.log("Selected rating:", value)}
          />
          <Checkbox
            label="ยืนยันการส่งรีวิว"
            helperText="กรุณาอ่านและยืนยันก่อนส่งรีวิว"
          />
          <Checkbox
            label="ยืนยันการส่งรีวิว (State Error)"
            errorMessage="กรุณายืนยันก่อนส่งรีวิว"
          />
          <Switch
            label="เปิด/ปิดการแจ้งเตือน"
            helperText="เปิดเพื่อรับการแจ้งเตือน"
          />
          <div className="space-y-2">
            <span className="text-body font-medium block">รูปแบบการเรียน (Radio Group)</span>
            <div className="flex items-center gap-4">
              <RadioButton
                name="learningMode"
                label="Onsite"
                checked={learningMode === 'onsite'}
                onChange={() => setLearningMode('onsite')}
              />
              <RadioButton
                name="learningMode"
                label="Online"
                checked={learningMode === 'online'}
                onChange={() => setLearningMode('online')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Part 4: Feedback & Modals */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold border-l-4 border-accent pl-3">4. Feedback & Modal System</h2>
        <div className="flex flex-wrap gap-3 p-4 border border-border rounded-lg bg-surface">
          <Button
            variant="primary"
            onClick={() =>
              setModalState({
                isOpen: true,
                type: 'success',
                title: 'สำเร็จ',
                description: 'คุณได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว',
                showCancel: false,
                onConfirm: () => console.log("Confirmed success modal"), // ตัวอย่างการเรียกใช้งานฟังก์ชัน onConfirm
              })
            }
          >
            เปิด Modal Success
          </Button>
          <Button
            variant="danger-light"
            onClick={() =>
              setModalState({
                isOpen: true,
                type: 'danger',
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
                showCancel: true,
              })
            }
          >
            เปิด Modal Danger
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setModalState({
                isOpen: true,
                type: 'warning',
                title: 'คำเตือน',
                description: 'คุณกำลังจะลบข้อมูลนี้ คุณแน่ใจหรือไม่?',
                showCancel: true,
              })
            }
          >
            เปิด Modal Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setModalState({
                isOpen: true,
                type: 'info',
                title: 'ข้อมูล',
                description: 'นี่คือข้อมูลเพิ่มเติมเกี่ยวกับการดำเนินการนี้',
                showCancel: false,
              })
            }
          >
            เปิด Modal Info
          </Button>
        </div>
      </section>

      {/* Global Modal Instance */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
        showCancel={modalState.showCancel}
        onConfirm={modalState.onConfirm}
      />
    </div>
  );
}

export default UiExamplePage;