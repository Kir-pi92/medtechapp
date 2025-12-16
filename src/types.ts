import { z } from 'zod';

export const serviceReportSchema = z.object({
    id: z.string().optional(),
    reportNumber: z.string().optional(), // User-entered report number
    // Device Information
    deviceType: z.string().min(1, "Device type is required"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    tagNumber: z.string().optional(), // Künye No
    productionYear: z.string().optional(), // Üretim Yılı

    // Customer Information
    customerName: z.string().min(1, "Customer/Hospital name is required"),
    department: z.string().optional(),
    contactPerson: z.string().optional(),

    // Service Details
    faultDescription: z.string().min(10, "Please provide a detailed fault description"),
    actionTaken: z.string().min(10, "Please describe the action taken"),
    partsUsed: z.array(z.object({
        name: z.string(),
        code: z.string().optional(),
        quantity: z.number().min(1)
    })).optional(),

    // Status & Technician
    status: z.enum(['pending', 'completed', 'parts_needed', 'scrapped']),
    technicianName: z.string().min(1, "Technician name is required"),
    serviceDate: z.string().min(1, "Date is required"),

    // Notes
    notes: z.string().optional(),

    // Signatures
    technicianSignature: z.string().optional(),
    customerSignature: z.string().optional(),

    // Photos
    photos: z.array(z.string()).optional(),

    // Customer email for sending report
    customerEmail: z.string().email().optional().or(z.literal(''))
});

export type ServiceReport = z.infer<typeof serviceReportSchema>;

export type DeviceType =
    // Görüntüleme Cihazları
    | 'X-Ray'
    | 'CT Scanner'
    | 'MRI'
    | 'Ultrasound'
    | 'Mammography'
    | 'Fluoroscopy'
    | 'PET-CT'
    | 'SPECT'
    | 'Angiography'
    | 'C-Arm'
    | 'Dental X-Ray'
    | 'Panoramic X-Ray'
    // Yaşam Destek ve Monitörizasyon
    | 'Patient Monitor'
    | 'Ventilator'
    | 'Anesthesia Machine'
    | 'Defibrillator'
    | 'ECG Machine'
    | 'Pulse Oximeter'
    | 'Infusion Pump'
    | 'Syringe Pump'
    | 'CPAP-BPAP'
    | 'Oxygen Concentrator'
    | 'Suction Unit'
    | 'Nebulizer'
    // Laboratuvar Cihazları
    | 'Hematology Analyzer'
    | 'Biochemistry Analyzer'
    | 'Blood Gas Analyzer'
    | 'Coagulation Analyzer'
    | 'Immunoassay Analyzer'
    | 'Electrolyte Analyzer'
    | 'Urine Analyzer'
    | 'Centrifuge'
    | 'Microscope'
    | 'PCR Device'
    | 'ELISA Reader'
    | 'Blood Bank Equipment'
    // Cerrahi Cihazlar
    | 'Electrosurgical Unit'
    | 'Surgical Laser'
    | 'Endoscopy System'
    | 'Laparoscopy System'
    | 'Surgical Microscope'
    | 'Surgical Navigation'
    | 'Arthroscopy System'
    | 'Cryotherapy Device'
    // Sterilizasyon Cihazları
    | 'Autoclave'
    | 'EO Sterilizer'
    | 'Plasma Sterilizer'
    | 'Washer Disinfector'
    // Kardiyoloji Cihazları
    | 'Echocardiography'
    | 'Holter Monitor'
    | 'Stress Test System'
    | 'Pacemaker Programmer'
    | 'IABP'
    | 'ECMO'
    | 'Heart-Lung Machine'
    // Diyaliz ve Nefroloji
    | 'Hemodialysis Machine'
    | 'Peritoneal Dialysis'
    | 'Water Treatment System'
    // Fizik Tedavi ve Rehabilitasyon
    | 'Electrotherapy Device'
    | 'Ultrasound Therapy'
    | 'Shockwave Therapy'
    | 'Laser Therapy'
    | 'Traction Device'
    | 'CPM Device'
    // Oftalmoloji
    | 'Slit Lamp'
    | 'Fundus Camera'
    | 'OCT Device'
    | 'Autorefractor'
    | 'Perimeter'
    | 'Phaco Machine'
    | 'Ophthalmic Laser'
    // Diş Hekimliği
    | 'Dental Unit'
    | 'Dental Compressor'
    | 'Dental Laser'
    | 'Dental Implant Motor'
    // Ortopedi
    | 'Bone Densitometer'
    | 'Orthopedic Power Tools'
    | 'Traction Table'
    // Yenidoğan ve Pediatri
    | 'Incubator'
    | 'Infant Warmer'
    | 'Phototherapy Unit'
    | 'Neonatal Ventilator'
    | 'Bilirubinometer'
    // Genel Tıbbi Cihazlar
    | 'Blood Pressure Monitor'
    | 'Thermometer'
    | 'Glucometer'
    | 'Scale'
    | 'Height Meter'
    | 'Hospital Bed'
    | 'Stretcher'
    | 'Wheelchair'
    | 'Examination Light'
    | 'Operating Table'
    | 'Other';

export const DEVICE_TYPES: DeviceType[] = [
    // Görüntüleme Cihazları
    'X-Ray',
    'CT Scanner',
    'MRI',
    'Ultrasound',
    'Mammography',
    'Fluoroscopy',
    'PET-CT',
    'SPECT',
    'Angiography',
    'C-Arm',
    'Dental X-Ray',
    'Panoramic X-Ray',
    // Yaşam Destek ve Monitörizasyon
    'Patient Monitor',
    'Ventilator',
    'Anesthesia Machine',
    'Defibrillator',
    'ECG Machine',
    'Pulse Oximeter',
    'Infusion Pump',
    'Syringe Pump',
    'CPAP-BPAP',
    'Oxygen Concentrator',
    'Suction Unit',
    'Nebulizer',
    // Laboratuvar Cihazları
    'Hematology Analyzer',
    'Biochemistry Analyzer',
    'Blood Gas Analyzer',
    'Coagulation Analyzer',
    'Immunoassay Analyzer',
    'Electrolyte Analyzer',
    'Urine Analyzer',
    'Centrifuge',
    'Microscope',
    'PCR Device',
    'ELISA Reader',
    'Blood Bank Equipment',
    // Cerrahi Cihazlar
    'Electrosurgical Unit',
    'Surgical Laser',
    'Endoscopy System',
    'Laparoscopy System',
    'Surgical Microscope',
    'Surgical Navigation',
    'Arthroscopy System',
    'Cryotherapy Device',
    // Sterilizasyon Cihazları
    'Autoclave',
    'EO Sterilizer',
    'Plasma Sterilizer',
    'Washer Disinfector',
    // Kardiyoloji Cihazları
    'Echocardiography',
    'Holter Monitor',
    'Stress Test System',
    'Pacemaker Programmer',
    'IABP',
    'ECMO',
    'Heart-Lung Machine',
    // Diyaliz ve Nefroloji
    'Hemodialysis Machine',
    'Peritoneal Dialysis',
    'Water Treatment System',
    // Fizik Tedavi ve Rehabilitasyon
    'Electrotherapy Device',
    'Ultrasound Therapy',
    'Shockwave Therapy',
    'Laser Therapy',
    'Traction Device',
    'CPM Device',
    // Oftalmoloji
    'Slit Lamp',
    'Fundus Camera',
    'OCT Device',
    'Autorefractor',
    'Perimeter',
    'Phaco Machine',
    'Ophthalmic Laser',
    // Diş Hekimliği
    'Dental Unit',
    'Dental Compressor',
    'Dental Laser',
    'Dental Implant Motor',
    // Ortopedi
    'Bone Densitometer',
    'Orthopedic Power Tools',
    'Traction Table',
    // Yenidoğan ve Pediatri
    'Incubator',
    'Infant Warmer',
    'Phototherapy Unit',
    'Neonatal Ventilator',
    'Bilirubinometer',
    // Genel Tıbbi Cihazlar
    'Blood Pressure Monitor',
    'Thermometer',
    'Glucometer',
    'Scale',
    'Height Meter',
    'Hospital Bed',
    'Stretcher',
    'Wheelchair',
    'Examination Light',
    'Operating Table',
    'Other'
];
