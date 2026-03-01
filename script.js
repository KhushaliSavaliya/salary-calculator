$(document).ready(function () {
    // 1. Initialize Default Date
    const today = new Date();
    $('#monthInput').val(today.toISOString().substring(0, 7));

    // 2. Calculation Logic
    $('#calculateBtn').on('click', function () {
        const dateValue = $('#monthInput').val();
        const baseSalary = parseFloat($('#baseSalary').val()) || 0;
        const totalLeavesTaken = parseInt($('#totalLeaves').val()) || 0;
        const publicHolidays = parseInt($('#holidays').val()) || 0;

        if (!dateValue) {
            alert("Please select a month!");
            return;
        }

        const [year, month] = dateValue.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        // Standard Payroll Logic: Daily Rate = Base / Total Days in Month
        const dailyRate = baseSalary / daysInMonth;

        // Apply 1 Paid Leave Rule
        // If they took 0 leaves, they get full pay.
        // If they took 3 leaves, 1 is paid, 2 are unpaid (Loss of Pay).
        const paidLeaveCredit = 1;
        let unpaidDays = 0;

        if (totalLeavesTaken > paidLeaveCredit) {
            unpaidDays = totalLeavesTaken - paidLeaveCredit;
        }

        const totalDeduction = unpaidDays * dailyRate;
        const finalPayout = baseSalary - totalDeduction;

        // Calculate Work Days for the report display
        let offDaysCount = 0;
        let saturdaysFound = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0) offDaysCount++; // Sundays
            else if (dayOfWeek === 6) {
                saturdaysFound++;
                if (saturdaysFound === 2 || saturdaysFound === 4) offDaysCount++; // 2nd/4th Sat
            }
        }

        const workDays = daysInMonth - offDaysCount - publicHolidays;

        // 3. Update UI
        updateUI(daysInMonth, offDaysCount, workDays, Math.max(0, finalPayout));
    });

    function updateUI(total, off, work, final) {
        $('#resTotalDays').text(total);
        $('#resOffDays').text(off);
        $('#resWorkDays').text(work);

        $({ Counter: 0 }).animate({ Counter: final }, {
            duration: 1000,
            step: function () {
                $('#finalSalary').text(this.Counter.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
            }
        });
    }
});