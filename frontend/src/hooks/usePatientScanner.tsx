export const usePatientScanner = (QrCode: string) => {

    const formatCedula = /^\d{1,2}-\d{3,4}-\d{3,4}$/;

    if (!QrCode) return null;

    const id = QrCode.split("|");
    const cedula = id[0];
    const cedulaNorma = formatCedula.test(cedula);

    if (!cedulaNorma) {
        console.log("Formato no válido");
        return null;
    } else {
        return cedula;

    }
};