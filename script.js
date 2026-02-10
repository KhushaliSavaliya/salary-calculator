$(document).ready(function () {
    // 1. Initialize Default Date (Current Month)
    const today = new Date();
    const formattedMonth = today.toISOString().substring(0, 7);
    $('#monthInput').val(formattedMonth);

    // 2. Calculation Logic
    $('#calculateBtn').on('click', function () {
        const dateValue = $('#monthInput').val();
        const baseSalary = parseFloat($('#baseSalary').val()) || 0;
        const paidLeaves = parseInt($('#paidLeaves').val()) || 0;
        const unpaidLeaves = parseInt($('#unpaidLeaves').val()) || 0;
        const publicHolidays = parseInt($('#holidays').val()) || 0;

        if (!dateValue) {
            alert("Please select a month first!");
            return;
        }

        const [year, month] = dateValue.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        let offDays = 0;
        let saturdaysFound = 0;

        // Loop through every day of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const dayName = dateObj.getDay(); // 0 = Sun, 6 = Sat

            if (dayName === 0) {
                // It's a Sunday
                offDays++;
            } else if (dayName === 6) {
                // It's a Saturday
                saturdaysFound++;
                if (saturdaysFound === 2 || saturdaysFound === 4) {
                    offDays++;
                }
            }
        }

        // Logic:
        // Net Working Days = Total Days - (Sundays + 2nd/4th Sat) - Public Holidays
        const netWorkingDays = daysInMonth - offDays - publicHolidays;

        // Payable Days = Net Working Days - Unpaid Leaves
        // Note: Paid leaves are part of your net working days payout
        const payableDays = netWorkingDays - unpaidLeaves;

        // Calculate Final Amount
        // Salary Per Day is based on the Standard working days of that month
        let finalPayout = 0;
        if (netWorkingDays > 0) {
            const perDayRate = baseSalary / netWorkingDays;
            finalPayout = perDayRate * payableDays;
        }

        // 3. Update UI with Animation
        updateUI(daysInMonth, offDays, netWorkingDays, finalPayout);
    });

    function updateUI(total, off, work, final) {
        $('#resTotalDays').text(total);
        $('#resOffDays').text(off);
        $('#resWorkDays').text(work);

        // Animate the number for the final salary
        $({ Counter: 0 }).animate({ Counter: final }, {
            duration: 800,
            easing: 'swing',
            step: function () {
                $('#finalSalary').text(this.Counter.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
            }
        });
    }
});