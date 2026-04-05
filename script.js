$(document).ready(function () {
    const today = new Date();
    $('#monthInput').val(today.toISOString().substring(0, 7));

    $('#calculateBtn').on('click', function () {
        const dateValue = $('#monthInput').val();
        const baseSalary = parseFloat($('#baseSalary').val()) || 0;
        const plQuota = parseInt($('#plQuota').val()) || 0; // Default 1
        const totalLeavesTaken = parseInt($('#totalLeaves').val()) || 0;
        const publicHolidays = parseInt($('#holidays').val()) || 0;

        if (!dateValue) return alert("Please select a month!");

        const [year, month] = dateValue.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        // 1. Calculate Weekends (Sundays + 2nd/4th Saturdays)
        let offDaysCount = 0;
        let saturdaysFound = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0) offDaysCount++; // Sundays
            else if (dayOfWeek === 6) {
                saturdaysFound++;
                if (saturdaysFound === 2 || saturdaysFound === 4) offDaysCount++;
            }
        }

        // 2. Calculate Actual Working Days (The divisor for Daily Rate)
        const totalWorkingDays = daysInMonth - (offDaysCount + publicHolidays);

        // 3. Calculate Daily Rate based on Working Days
        const dailyRate = baseSalary / totalWorkingDays;

        const leaveBalance = plQuota - totalLeavesTaken;

        let finalPayout = baseSalary;

        // 4. Leave Logic
        if (leaveBalance > 0) {
            // CASE: You have leftover paid leaves (e.g., Quota 5, Taken 4 = 1 left)
            // We ADD the value of the unused days to the base salary
            finalPayout = baseSalary + (leaveBalance * dailyRate);
        }
        else if (leaveBalance < 0) {
            // CASE: You took more than the quota (e.g., Quota 1, Taken 4 = -3)
            // We SUBTRACT the absolute value of the extra days
            const unpaidDays = Math.abs(leaveBalance);
            finalPayout = baseSalary - (unpaidDays * dailyRate);
        }
        // Case: Exactly quota (e.g. 1) -> No deduction, no bonus (Base Salary remains)

        // 5. Update UI
        updateUI(daysInMonth, offDaysCount, totalWorkingDays, Math.max(0, finalPayout));
    });

    function updateUI(total, off, work, final) {
        $('#resTotalDays').text(total);
        $('#resOffDays').text(off);
        $('#resWorkDays').text(work);

        $({ Counter: 0 }).animate({ Counter: final }, {
            duration: 800,
            step: function () {
                $('#finalSalary').text(this.Counter.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
            }
        });
    }
});