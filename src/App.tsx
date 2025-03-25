import { Input } from "./components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./components/ui/textarea"
import { useState } from "react";
import { Button } from "./components/ui/button";

function App() {
  const [startOfWorkTime, setStartOfWorkTime] = useState('08:30');
  const [endOfWorkTime, setEndOfWorkTime] = useState('17:00');
  const [lateCompensation, setLateCompensation] = useState(5);
  const [excelData, setExcelData] = useState('');
  const [totalEarlyMinutes, setTotalEarlyMinutes] = useState(0);
  const [totalLateMinutes, setTotalLateMinutes] = useState(0);
  const [isSubmit, setIsSubmit] = useState(false);


  // Example for pasting from Excel
  const handleReset = () => {
    setStartOfWorkTime('08:30');
    setEndOfWorkTime('17:00');
    setLateCompensation(5);
    setExcelData('');
    setIsSubmit(false);
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { totalEarlyMinutes, totalLateMinutes } = calculateLateAndEarly(startOfWorkTime, endOfWorkTime, excelData, lateCompensation);
    setTotalEarlyMinutes(totalEarlyMinutes);
    setTotalLateMinutes(totalLateMinutes);
    setIsSubmit(true);
  }

  return (
    <form className='w-full min-h-screen flex flex-col items-center gap-8' onSubmit={(e) => { handleSubmit(e) }}>
      <h1 className="py-4 text-3xl text-zinc-800 font-medium">Hitung Absen</h1>
      <div className="flex w-full justify-center items-center gap-5">
        <div className="space-y-2">
          <Label>Jam Masuk</Label>
          <Input required value={startOfWorkTime} onChange={(e) => setStartOfWorkTime(e.currentTarget.value)} />
        </div>
        <div className="space-y-2">
          <Label>Jam Pulang</Label>
          <Input required value={endOfWorkTime} onChange={(e) => setEndOfWorkTime(e.currentTarget.value)} />
        </div>
      </div>
      <div className="w-48 space-y-2">
        <Label>{`Kompensasi Waktu Terlambat (dalam menit)`}</Label>
        <Input type="number" value={lateCompensation} onChange={(e) => setLateCompensation(Number(e.currentTarget.value))} />
      </div>
      <div className="space-y-2 w-96">
        <Label>Absensi</Label>
        <Textarea required value={excelData} onChange={(e) => setExcelData(e.currentTarget.value)} />
      </div>
      <div className="space-x-4">
        <Button type="button" variant={'secondary'} onClick={handleReset}>Reset</Button>
        <Button type="submit">HITUNG</Button>
      </div>
      {
        isSubmit &&
        (<div className="flex flex-col justify-center items-center gap-2">
          <h2 className="font-medium text-2xl mt-5">Hasil</h2>
          <p>Total Terlambat Masuk: <b>{totalLateMinutes} Menit</b></p>
          <p>Total Pulang Cepat: <b>{totalEarlyMinutes} Menit</b></p>
        </div>)
      }
    </form>
  )
}


function calculateLateAndEarly(defaultTime: string, endOfWorkTime: string, excelData: string, lateCompensation: number): { totalLateMinutes: number, totalEarlyMinutes: number } {
  const [defaultHour, defaultMinute] = defaultTime.split(':').map(Number);
  const defaultInMinutes = defaultHour * 60 + defaultMinute;
  const [endHour, endMinute] = endOfWorkTime.split(':').map(Number);
  const endOfWorkMinutes = endHour * 60 + endMinute;
  const schedule = excelData.replace(/\n/g, '').trim();

  const days = schedule.split('\t');
  let totalLateMinutes = 0;
  let totalEarlyMinutes = 0;

  days.forEach((day: string) => {
    if (day === 'OFF' || day.trim() === '') return;

    const [clockIn, clockOut] = day.split('-');
    const [inHour, inMinute] = clockIn.split(':').map(Number);
    const [outHour, outMinute] = clockOut.split(':').map(Number);

    const clockInMinutes = inHour * 60 + inMinute;
    const clockOutMinutes = outHour * 60 + outMinute;

    if (clockInMinutes > defaultInMinutes + lateCompensation) {
      totalLateMinutes += clockInMinutes - (defaultInMinutes + lateCompensation);
    }

    if (clockOutMinutes < endOfWorkMinutes) {
      totalEarlyMinutes += endOfWorkMinutes - clockOutMinutes;
    }
  });

  return { totalLateMinutes, totalEarlyMinutes }
}

export default App
