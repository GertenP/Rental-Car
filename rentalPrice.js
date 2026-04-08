
function price(pickup, dropoff, pickupDate, dropoffDate, type, age) {
    if (age < 18) {
        return "Driver too young - cannot quote the price";
    }

    const clazz = ["Compact", "Electric", "Cabrio", "Racer"].includes(type) ? type : "Unknown";  // Kaotasin mõttetu lisafunktsiooni...

    if (age <= 21 && clazz !== "Compact") {
        return "Drivers 21 y/o or less can only rent Compact vehicles";
    }
    const season = getSeason(pickupDate, dropoffDate);

    let rentalprice = age * days;

    if (clazz === "Racer" && age <= 25 && season === "High") {
        rentalprice *= 1.5;
    }

    if (season === "High") {
        rentalprice *= 1.15;
    }

    const days = get_days(pickupDate, dropoffDate);

    if (days > 10 && season === "Low") {
        rentalprice *= 0.9;
    }
    return '$' + rentalprice;
}

function get_days(pickupDate, dropoffDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(pickupDate);
    const secondDate = new Date(dropoffDate);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    const start = 4;
    const end = 10;

    const pickupMonth = pickup.getMonth();
    const dropoffMonth = dropoff.getMonth();

    if (
        (pickupMonth >= start && pickupMonth <= end) ||
        (dropoffMonth >= start && dropoffMonth <= end) ||
        (pickupMonth < start && dropoffMonth > end)
    ) {
        return "High";
    } else {
        return "Low";
    }
}

exports.price = price;