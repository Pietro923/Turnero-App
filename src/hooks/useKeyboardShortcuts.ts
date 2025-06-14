// hooks/useKeyboardShortcuts.ts
"use client"
import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onF1?: () => void; // Turno manual
  onF2?: () => void; // Registro de caja
  onF3?: () => void; // Historial de pagos
  onCtrlR?: () => void; // Refresh
  onEscape?: () => void; // Cerrar modales
}

export const useKeyboardShortcuts = ({
  onF1,
  onF2,
  onF3,
  onCtrlR,
  onEscape
}: KeyboardShortcutsProps) => {
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevenir atajos si estamos escribiendo en un input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      ) {
        return;
      }

      switch (event.key) {
        case 'F1':
          event.preventDefault();
          onF1?.();
          break;
          
        case 'F2':
          event.preventDefault();
          onF2?.();
          break;
          
        case 'F3':
          event.preventDefault();
          onF3?.();
          break;
          
        case 'Escape':
          onEscape?.();
          break;
          
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onCtrlR?.();
          }
          break;
      }
    };

    // Agregar listener
    window.addEventListener('keydown', handleKeyPress);

    // Mostrar ayuda de atajos
    console.log(`
🎯 Atajos de teclado disponibles:
F1 - Agregar turno manual
F2 - Registro de caja
F3 - Historial de pagos
Ctrl+R - Actualizar datos
Esc - Cerrar modales
    `);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onF1, onF2, onF3, onCtrlR, onEscape]);

  return null; // Hook no renderiza nada
};