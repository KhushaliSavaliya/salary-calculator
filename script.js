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

        // 1. Calculate Daily Rate
        // Formula: Base Salary / Total days in that specific month
        const dailyRate = baseSalary / daysInMonth;

        let finalPayout = baseSalary;
        const paidLeaveCredit = 1;

        // 2. Apply Custom Leave Rules
        if (totalLeavesTaken === 0) {
            // CASE: No leaves taken -> Add 1 day extra pay (Incentive)
            finalPayout = baseSalary + dailyRate;
        }
        else if (totalLeavesTaken > paidLeaveCredit) {
            // CASE: More than 1 leave -> Deduct unpaid days
            // Example: 2 leaves taken, 1 is paid, 1 is deducted
            const unpaidDays = totalLeavesTaken - paidLeaveCredit;
            const totalDeduction = unpaidDays * dailyRate;
            finalPayout = baseSalary - totalDeduction;
        }
        // CASE: Exactly 1 leave taken -> finalPayout remains exactly baseSalary

        // 3. Calculate Work Days for Display
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

        // 4. Update UI
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