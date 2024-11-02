function getPersonalAllowance(taxCode) {
    const numericPart = parseInt(taxCode.match(/\d+/), 10);
    const letterPart = taxCode.match(/[A-Z]+/)[0];

    let personalAllowance = numericPart * 10 || 12570; // Default to 12570 if not provided

    // Special cases where no personal allowance is applied
    if (['BR', 'D0', 'D1', 'NT'].includes(letterPart)) {
        personalAllowance = 0;
    }

    return personalAllowance;
}

function calculate() {
    const annualSalary = parseFloat(document.getElementById('annualSalary').value);
    const taxCode = document.getElementById('taxCode').value;
    const employeePensionPercent = parseFloat(document.getElementById('employeePensionPercent').value) || 5; // Default to 5%
    const salarySacrificePercent = parseFloat(document.getElementById('salarySacrifice').value) || 5;

    if (isNaN(annualSalary) || annualSalary <= 0 || salarySacrificePercent < 5) {
        document.getElementById('output').innerHTML = "Please enter a valid annual salary and ensure the salary sacrifice is at least 5%.";
        return;
    }

    const personalAllowance = getPersonalAllowance(taxCode);

    // Employer NI calculation (13.8% above £9,100)
    let employerNI = 0;
    if (annualSalary > 9100) {
        employerNI = (annualSalary - 9100) * 0.138;
    }

    // Employee NI calculation (12% up to £50,270, 2% above £50,270)
    let employeeNI = 0;
    if (annualSalary > 12570) {
        employeeNI = (Math.min(annualSalary, 50270) - 12570) * 0.08;
        if (annualSalary > 50270) {
            employeeNI += (annualSalary - 50270) * 0.02;
        }
    }

    // Employer Pension calculation (3% above £6,240)
    const employerPension = (annualSalary > 6240) ? (annualSalary - 6240) * 0.03 : 0;

    // Employee Pension calculation using user input percentage
    const employeePension = (annualSalary > 6240) ? (annualSalary - 6240) * (employeePensionPercent / 100) : 0;

    // PAYE tax calculation
    let paye = 0;
    if (annualSalary > personalAllowance) {
        if (annualSalary <= 50270) {
            paye = (annualSalary - personalAllowance) * 0.2;
        } else if (annualSalary <= 125140) {
            paye = (50270 - personalAllowance) * 0.2 + (annualSalary - 50270) * 0.4;
        } else {
            paye = (50270 - personalAllowance) * 0.2 + (125140 - 50270) * 0.4 + (annualSalary - 125140) * 0.45;
        }
    }

    // Net pay calculation (Auto-enrollment scheme)
    const grossPay = annualSalary;
    const totalDeductions = employeeNI + employeePension + paye;
    const netPay = grossPay - totalDeductions;

    // Salary Sacrifice calculations
    const salarySacrificeAmount = (annualSalary * (salarySacrificePercent / 100));
    const adjustedAnnualSalary = annualSalary - salarySacrificeAmount;
    let adjustedPaye = 0;

    if (adjustedAnnualSalary > personalAllowance) {
        if (adjustedAnnualSalary <= 50270) {
            adjustedPaye = (adjustedAnnualSalary - personalAllowance) * 0.2;
        } else if (adjustedAnnualSalary <= 125140) {
            adjustedPaye = (50270 - personalAllowance) * 0.2 + (adjustedAnnualSalary - 50270) * 0.4;
        } else {
            adjustedPaye = (50270 - personalAllowance) * 0.2 + (125140 - 50270) * 0.4 + (adjustedAnnualSalary - 125140) * 0.45;
        }
    }

    let adjustedEmployeeNI = (adjustedAnnualSalary > 12570) ? (Math.min(adjustedAnnualSalary, 50270) - 12570) * 0.12 : 0;
    if (adjustedAnnualSalary > 50270) {
        adjustedEmployeeNI += (adjustedAnnualSalary - 50270) * 0.02;
    }

    const adjustedNetPay = adjustedAnnualSalary - adjustedEmployeeNI - adjustedPaye;

    document.getElementById('output').innerHTML = `
        <h3>Results (Auto-enrollment):</h3>
        <p>Annual Salary: £${grossPay.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Employer National Insurance: £${employerNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Employee National Insurance: £${employeeNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Employer Pension: £${employerPension.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Employee Pension: £${employeePension.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>PAYE: £${paye.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Net Pay: £${netPay.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <h3>Results (Salary Sacrifice):</h3>
        <p>Adjusted Annual Salary: £${adjustedAnnualSalary.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Adjusted Employee NI: £${adjustedEmployeeNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Adjusted PAYE: £${adjustedPaye.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Net Pay with Salary Sacrifice: £${adjustedNetPay.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    `;
}
