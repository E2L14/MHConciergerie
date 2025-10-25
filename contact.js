document.addEventListener('DOMContentLoaded', function() {
    console.log('Script contact chargé');
    
    const checkbox = document.getElementById('request-appointment');
    const appointmentFields = document.getElementById('appointment-fields');
    
    console.log('Checkbox:', checkbox);
    console.log('Fields:', appointmentFields);
    
    if (checkbox && appointmentFields) {
        checkbox.addEventListener('change', function() {
            console.log('Change détecté! Checked:', this.checked);
            
            if (this.checked) {
                appointmentFields.style.display = 'block';
                console.log('Affichage des champs');
            } else {
                appointmentFields.style.display = 'none';
                console.log('Masquage des champs');
            }
        });
    } else {
        console.error('Éléments non trouvés!');
    }
});