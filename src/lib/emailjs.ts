// src/lib/emailjs.ts
import emailjs from '@emailjs/browser';

// 🔑 CONFIGURACIÓN - Reemplaza con tus valores reales
const EMAILJS_CONFIG = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'tu_public_key_aqui',
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'tu_service_id_aqui',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'tu_template_id_aqui',
  TO_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@tupeluqueria.com'
};

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export interface NewAppointmentData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  barber_name: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}

export async function sendNewAppointmentNotification(appointmentData: NewAppointmentData) {
  try {
    console.log('📧 Enviando notificación de nuevo turno...');
    
    // Preparar datos para el template
    const templateParams = {
      to_email: EMAILJS_CONFIG.TO_EMAIL,
      ...appointmentData,
      // Formatear fecha para mostrar mejor
      appointment_date: new Date(appointmentData.appointment_date).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      // Formatear hora de creación
      created_at: new Date(appointmentData.created_at).toLocaleString('es-AR')
    };

    console.log('📋 Datos del email:', templateParams);

    // Enviar email
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email enviado exitosamente:', response);
    return { success: true, response };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error };
  }
}

// Función de prueba para verificar configuración
export async function testEmailConfiguration() {
  const testData: NewAppointmentData = {
    customer_name: 'Cliente de Prueba',
    customer_phone: '+54 9 123 456-7890',
    customer_email: 'cliente@test.com',
    barber_name: 'Carlos',
    service_name: 'Corte + Barba',
    service_price: 4500,
    service_duration: 45,
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '15:30',
    created_at: new Date().toISOString()
  };

  return await sendNewAppointmentNotification(testData);
}