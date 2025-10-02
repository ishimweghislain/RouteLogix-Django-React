import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TripLogsResponse, LogGrid } from '../types';

export const exportLogsToPDF = async (logsData: TripLogsResponse): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // Title page
    pdf.setFontSize(20);
    pdf.text('Electronic Logging Device (ELD) Report', margin, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Trip ID: ${logsData.trip_id}`, margin, 50);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 60);
    pdf.text(`Total Days: ${logsData.hos_summary.trip_duration_days}`, margin, 70);
    pdf.text(`Total Driving Hours: ${logsData.hos_summary.total_driving_hours.toFixed(1)}`, margin, 80);
    pdf.text(`Cycle Type: ${logsData.hos_summary.cycle_type}`, margin, 90);
    pdf.text(`Hours Remaining: ${logsData.hos_summary.cycle_hours_remaining.toFixed(1)}`, margin, 100);

    // Add page for each day
    for (let i = 0; i < logsData.log_grids.length; i++) {
      const grid = logsData.log_grids[i];
      
      if (i > 0) {
        pdf.addPage();
      } else {
        pdf.addPage(); // Start daily logs on new page
      }

      // Day header
      pdf.setFontSize(16);
      pdf.text(`Day ${i + 1} - ${new Date(grid.date).toLocaleDateString()}`, margin, 30);

      // Time totals
      pdf.setFontSize(10);
      const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
      };

      pdf.text(`Driving: ${formatTime(grid.total_driving_time)}`, margin, 45);
      pdf.text(`On Duty: ${formatTime(grid.total_on_duty_time)}`, margin + 50, 45);
      pdf.text(`Sleeper: ${formatTime(grid.total_sleeper_time)}`, margin + 100, 45);
      pdf.text(`Off Duty: ${formatTime(grid.total_off_duty_time)}`, margin + 150, 45);

      // Draw time grid
      const gridY = 60;
      const cellWidth = (pageWidth - 2 * margin) / 24;
      const cellHeight = 8;

      // Hour labels
      pdf.setFontSize(8);
      for (let hour = 0; hour < 24; hour++) {
        pdf.text(hour.toString().padStart(2, '0'), margin + hour * cellWidth + cellWidth/2 - 3, gridY - 5);
      }

      // Draw grid
      for (let slot = 0; slot < 96; slot++) {
        const hour = Math.floor(slot / 4);
        const x = margin + hour * cellWidth + (slot % 4) * (cellWidth / 4);
        const status = grid.grid[slot];
        
        let color: [number, number, number] = [240, 240, 240]; // Default gray
        switch (status) {
          case 'driving':
            color = [254, 202, 202]; // Red
            break;
          case 'on_duty':
            color = [253, 230, 138]; // Yellow
            break;
          case 'sleeper':
            color = [221, 214, 254]; // Purple
            break;
          case 'off_duty':
            color = [243, 244, 246]; // Gray
            break;
        }

        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x, gridY, cellWidth / 4, cellHeight, 'F');
      }

      // Draw grid lines
      pdf.setDrawColor(200, 200, 200);
      for (let hour = 0; hour <= 24; hour++) {
        const x = margin + hour * cellWidth;
        pdf.line(x, gridY, x, gridY + cellHeight);
      }
      pdf.line(margin, gridY, pageWidth - margin, gridY);
      pdf.line(margin, gridY + cellHeight, pageWidth - margin, gridY + cellHeight);

      // Legend
      const legendY = gridY + cellHeight + 15;
      pdf.setFontSize(8);
      
      const legendItems = [
        { label: 'Off Duty', color: [243, 244, 246] },
        { label: 'Sleeper Berth', color: [221, 214, 254] },
        { label: 'Driving', color: [254, 202, 202] },
        { label: 'On Duty', color: [253, 230, 138] }
      ];

      legendItems.forEach((item, index) => {
        const x = margin + index * 40;
        pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
        pdf.rect(x, legendY, 5, 3, 'F');
        pdf.text(item.label, x + 8, legendY + 2);
      });

      // Log entries table if available
      if (grid.entries && grid.entries.length > 0) {
        const tableY = legendY + 15;
        pdf.setFontSize(9);
        pdf.text('Log Entries:', margin, tableY);
        
        const headers = ['Status', 'Start Time', 'End Time', 'Duration'];
        const colWidths = [40, 30, 30, 25];
        let currentY = tableY + 8;

        // Table headers
        headers.forEach((header, index) => {
          const x = margin + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
          pdf.text(header, x, currentY);
        });
        
        currentY += 5;
        
        // Table data
        grid.entries.forEach((entry) => {
          if (currentY > pageHeight - 30) return; // Don't overflow page
          
          const statusLabel = entry.status.replace('_', ' ').toUpperCase();
          const data = [
            statusLabel,
            entry.start_time,
            entry.end_time,
            formatTime(entry.duration_minutes)
          ];
          
          data.forEach((text, index) => {
            const x = margin + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
            pdf.text(text, x, currentY);
          });
          
          currentY += 4;
        });
      }
    }

    // Violations page
    if (logsData.violations && logsData.violations.length > 0) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('HOS Violations', margin, 30);
      
      let violationY = 45;
      pdf.setFontSize(10);
      
      logsData.violations.forEach((violation, index) => {
        if (violationY > pageHeight - 30) {
          pdf.addPage();
          violationY = 30;
        }
        
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${violation.violation_type.replace('_', ' ').toUpperCase()}`, margin, violationY);
        violationY += 6;
        
        pdf.setFont(undefined, 'normal');
        pdf.text(`Severity: ${violation.severity.toUpperCase()}`, margin + 5, violationY);
        violationY += 5;
        
        const lines = pdf.splitTextToSize(violation.description, pageWidth - 2 * margin - 5);
        pdf.text(lines, margin + 5, violationY);
        violationY += lines.length * 5 + 5;
      });
    }

    // Save the PDF
    pdf.save(`ELD_Logs_Trip_${logsData.trip_id}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const exportElementToPDF = async (elementId: string, filename: string = 'export.pdf'): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting element to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};
