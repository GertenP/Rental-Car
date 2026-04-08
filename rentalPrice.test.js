const { price, getDays, getSeason } = require('./rentalPrice');

const LOW_DATE_1 = '2024-01-10';
const LOW_DATE_2 = '2024-01-15';
const HIGH_DATE_1 = '2024-06-10';
const HIGH_DATE_2 = '2024-06-15';

describe('getDays', () => {
    test('sama päev on 1 päev', () => {
        expect(getDays('2024-01-01', '2024-01-01')).toBe(1);
    });

    test('järgmine päev on 2 päeva', () => {
        expect(getDays('2024-01-01', '2024-01-02')).toBe(2);
    });

    test('5 päeva rent', () => {
        expect(getDays(LOW_DATE_1, LOW_DATE_2)).toBe(6);
    });
});

describe('getSeason', () => {
    test('jaanuar on madalhooaeg', () => {
        expect(getSeason('2024-01-01', '2024-01-10')).toBe('Low');
    });

    test('juuni on kõrghooaeg', () => {
        expect(getSeason(HIGH_DATE_1, HIGH_DATE_2)).toBe('High');
    });

    test('aprill on kõrghooaeg', () => {
        expect(getSeason('2024-04-01', '2024-04-10')).toBe('High');
    });

    test('oktoober on kõrghooaeg', () => {
        expect(getSeason('2024-10-01', '2024-10-31')).toBe('High');
    });

    test('november on madalhooaeg', () => {
        expect(getSeason('2024-11-01', '2024-11-10')).toBe('Low');
    });

    test('rent algab madalhooajal ja lõpeb kõrghooajal', () => {
        expect(getSeason('2024-03-28', '2024-04-05')).toBe('High');
    });

    test('rent hõlmab tervet aastat', () => {
        expect(getSeason('2024-01-01', '2024-12-31')).toBe('High');
    });
});

describe('price - vanuse validatsioon', () => {
    test('alla 18 ei saa rentida', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 17, 24)).toBe("Driver too young - cannot quote the price");
    });

    test('täpselt 18 saab rentida', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 18, 24)).not.toContain("too young");
    });
});

describe('price - juhiloa validatsioon', () => {
    test('alla 12 kuu litsents ei saa rentida', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 25, 11)).toBe("Driver's license too new - cannot quote the price");
    });

    test('täpselt 12 kuud saab rentida', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 25, 12)).not.toContain("too new");
    });
});

describe('price - auto tüübi validatsioon', () => {
    test('tundmatu auto tüüp tagastab vea', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Van', 25, 24)).toBe("Unknown car type");
    });

    test('21-aastane saab rentida ainult Compact', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Electric', 21, 24)).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
    });

    test('21-aastane saab rentida Compact', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 21, 24)).not.toContain("only rent Compact");
    });

    test('22-aastane saab rentida Electric', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Electric', 22, 24)).not.toContain("only rent Compact");
    });
});

describe('price - TDD Weekend pricing', () => {
    test('50 year old driver rents for 3 weekdays (Mon-Wed) - Total $150', () => {
        const mon = '2026-02-09';
        const wed = '2026-02-11';
        expect(price(mon, wed, 'Compact', 50, 60)).toBe('$150.00');
    });

    test('50 year old driver rents for 3 days (Thu-Sat) - Total $152.50', () => {
        const thu = '2026-02-12';
        const sat = '2026-02-14';
        expect(price(thu, sat, 'Compact', 50, 60)).toBe('$152.50');
    });
});

describe('price - põhihind', () => {
    test('madalhooajal on hind vanus * päevad', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 30, 24)).toBe('$180.00');
    });
});

describe('price - kõrghooaja lisatasu', () => {
    test('kõrghooajal hind +15%', () => {
        expect(price(HIGH_DATE_1, HIGH_DATE_2, 'Compact', 30, 24)).toBe('$207.00');
    });
});

describe('price - pikk rent madalhooajal', () => {
    test('üle 10 päeva madalhooajal -10%', () => {
        expect(price('2024-01-01', '2024-01-12', 'Compact', 30, 24)).toBe('$324.00');
    });

    test('täpselt 10 päeva madalhooajal ei saa allahindlust', () => {
        expect(price('2024-01-01', '2024-01-10', 'Compact', 30, 24)).toBe('$270.00');
    });
});

describe('price - Racer noor juht kõrghooajal', () => {
    test('25-aastane Racer kõrghooajal +50%', () => {
        expect(price(HIGH_DATE_1, HIGH_DATE_2, 'Racer', 25, 24)).toBe('$258.75');
    });

    test('26-aastane Racer kõrghooajal ei saa lisatasu', () => {
        expect(price(HIGH_DATE_1, HIGH_DATE_2, 'Racer', 26, 24)).toBe('$179.40');
    });

    test('25-aastane Racer madalhooajal ei saa lisatasu', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Racer', 25, 24)).toBe('$150.00');
    });
});

describe('price - litsents alla 2 aasta', () => {
    test('alla 24 kuu litsents +30%', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 30, 23)).toBe('$234.00');
    });

    test('täpselt 24 kuud ei saa lisatasu', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 30, 24)).toBe('$180.00');
    });
});

describe('price - litsents alla 3 aasta kõrghooajal', () => {
    test('alla 36 kuu litsents kõrghooajal +15€/päev', () => {
        expect(price(HIGH_DATE_1, HIGH_DATE_2, 'Compact', 30, 35)).toBe('$297.00');
    });

    test('alla 36 kuu litsents madalhooajal ei saa lisatasu', () => {
        expect(price(LOW_DATE_1, LOW_DATE_2, 'Compact', 30, 35)).toBe('$180.00');
    });

    test('täpselt 36 kuud ei saa lisatasu', () => {
        expect(price(HIGH_DATE_1, HIGH_DATE_2, 'Compact', 30, 36)).toBe('$207.00');
    });
});