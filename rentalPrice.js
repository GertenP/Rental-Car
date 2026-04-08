const VALID_CAR_CLASSES = ["Compact", "Electric", "Cabrio", "Racer"];

const MIN_RENTAL_AGE = 18;
const MAX_YOUNG_DRIVER_AGE = 21;
const YOUNG_RACER_AGE_LIMIT = 25;

const HIGH_SEASON_START_MONTH = 4;
const HIGH_SEASON_END_MONTH = 10;

const HIGH_SEASON_MULTIPLIER = 1.15;
const RACER_YOUNG_DRIVER_MULTIPLIER = 1.5;
const LONG_RENTAL_DISCOUNT = 0.9;
const LONG_RENTAL_MIN_DAYS = 10;

const MIN_LICENSE_MONTHS = 12;
const NEW_LICENSE_MULTIPLIER = 1.30;
const NEW_LICENSE_THRESHOLD_MONTHS = 24;
const NEWER_LICENSE_THRESHOLD_MONTHS = 36;
const NEWER_LICENSE_HIGH_SEASON_DAILY_SURCHARGE = 15;


function price(pickupDate, dropoffDate, type, age, licenseAgeMonths) {
    if (age < MIN_RENTAL_AGE) {
        return "Driver too young - cannot quote the price";
    }

    if (licenseAgeMonths < MIN_LICENSE_MONTHS) {
        return "Driver's license too new - cannot quote the price";
    }

    const carClass = VALID_CAR_CLASSES.includes(type) ? type : "Unknown";

    if (carClass === "Unknown") {
        return "Unknown car type";
    }

    if (age <= MAX_YOUNG_DRIVER_AGE && carClass !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }

    const days = getDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    let rentalPrice = age * days;

    if (carClass === "Racer" && age <= YOUNG_RACER_AGE_LIMIT && season === "High") {
        rentalPrice *= RACER_YOUNG_DRIVER_MULTIPLIER;
    }

    if (season === "High") {
        rentalPrice *= HIGH_SEASON_MULTIPLIER;
    }

    if (days > LONG_RENTAL_MIN_DAYS && season === "Low") {
        rentalPrice *= LONG_RENTAL_DISCOUNT;
    }

    if (licenseAgeMonths < NEW_LICENSE_THRESHOLD_MONTHS) {
        rentalPrice *= NEW_LICENSE_MULTIPLIER;
    }

    if (licenseAgeMonths < NEWER_LICENSE_THRESHOLD_MONTHS && season === "High") {
        rentalPrice += NEWER_LICENSE_HIGH_SEASON_DAILY_SURCHARGE * days;
    }

    return '$' + rentalPrice.toFixed(2);
}

function getDays(pickupDate, dropoffDate) {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round(Math.abs((firstDate - secondDate) / ONE_DAY_MS)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    const isHighSeason =
        (pickupMonth >= HIGH_SEASON_START_MONTH && pickupMonth <= HIGH_SEASON_END_MONTH) ||
        (dropoffMonth >= HIGH_SEASON_START_MONTH && dropoffMonth <= HIGH_SEASON_END_MONTH) ||
        (pickupMonth < HIGH_SEASON_START_MONTH && dropoffMonth > HIGH_SEASON_END_MONTH);

    return isHighSeason ? "High" : "Low";
}

exports.price = price;
exports.getDays = getDays;
exports.getSeason = getSeason;