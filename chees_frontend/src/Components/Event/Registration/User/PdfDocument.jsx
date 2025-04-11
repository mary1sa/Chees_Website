import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';

const PdfDocument = ({ detailView, formatDate }) => {
  // Enhanced PDF styles
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'Helvetica',
      backgroundColor: '#f8f9fa'
    },
    container: {
      backgroundColor: '#ffffff',
      padding: 30,
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    header: {
      marginBottom: 25,
      textAlign: 'center',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: 15
    },
    title: {
      fontSize: 22,
      marginBottom: 5,
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    subtitle: {
      fontSize: 12,
      color: '#7f8c8d'
    },
    section: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: '#f8f9fa',
      borderRadius: 5
    },
    sectionTitle: {
      fontSize: 16,
      marginBottom: 10,
      fontWeight: 'bold',
      color: '#28a745',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: 5
    },
    item: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'center' // Changed to center for better badge alignment
    },
    label: {
      width: 80,
      fontWeight: 'semibold',
      color: '#34495e',
      fontSize: 12
    },
    value: {
      flex: 1,
      fontSize: 12,
      color: '#2c3e50',
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    badge: (status) => {
      const statusText = status || '';
      // Calculate approximate width based on text length
      const baseWidth = 8; // Minimum width in mm
      const charWidth = 1.5; // Approximate width per character in mm
      const calculatedWidth = baseWidth + (statusText.length * charWidth);
      
      return {
        backgroundColor: 
          status === 'confirmed' ? '#d4edda' : 
          status === 'pending' ? '#fff3cd' : 
          status === 'completed' ? '#d4edda' :
          status === 'failed' ? '#f8d7da' :
          '#e2e3e5',
        color: 
          status === 'confirmed' ? '#155724' : 
          status === 'pending' ? '#856404' : 
          status === 'completed' ? '#155724' :
          status === 'failed' ? '#721c24' :
          '#383d41',
        padding: '3px 8px',
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        minWidth: `${calculatedWidth}mm`,
        textAlign: 'center',
        marginRight: 5
      };
    },
    notesContainer: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#f1f8fe',
      borderLeft: '3px solid #28a745',
      borderRadius: 3
    },
    notesLabel: {
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#2980b9'
    },
    logo: {
      width: 120,
      marginBottom: 10,
      alignSelf: 'center'
    },
    footer: {
      marginTop: 30,
      textAlign: 'center',
      fontSize: 10,
      color: '#95a5a6',
      borderTop: '1px solid #e0e0e0',
      paddingTop: 10
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header with logo */}
          <View style={styles.header}>
            <Text style={styles.title}>EVENT REGISTRATION</Text>
            <Text style={styles.subtitle}>Registration Details #{detailView.id}</Text>
            <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
          </View>
          
          {/* Event Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EVENT INFORMATION</Text>
            <View style={styles.item}>
              <Text style={styles.label}>Event Title:</Text>
              <Text style={styles.value}>{detailView.event?.title || 'N/A'}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Date & Time:</Text>
              <Text style={styles.value}>
                {detailView.event?.start_date ? formatDate(detailView.event.start_date) : 'N/A'}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Venue:</Text>
              <Text style={styles.value}>{detailView.event?.venue || 'N/A'}</Text>
            </View>
          </View>

          {/* Registration Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REGISTRATION DETAILS</Text>
            <View style={styles.item}>
              <Text style={styles.label}>Status:</Text>
              <View style={styles.value}>
                <Text style={styles.badge(detailView.status)}>
                  {detailView.status}
                </Text>
              </View>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Payment:</Text>
              <View style={styles.value}>
                <Text style={styles.badge(detailView.payment_status)}>
                  {detailView.payment_status}
                </Text>
              </View>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Reg. #:</Text>
              <Text style={[styles.value, { fontWeight: 'bold' }]}>
                {detailView.registration_number || 'N/A'}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>Registered:</Text>
              <Text style={styles.value}>
                {detailView.registration_date ? formatDate(detailView.registration_date) : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Notes Section */}
          {detailView.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>ADDITIONAL NOTES:</Text>
              <Text style={styles.value}>{detailView.notes}</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Thank you for your registration!</Text>
            <Text>For any questions, please contact support@yourevent.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PdfDocument;