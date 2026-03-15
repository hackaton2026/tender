import { router } from 'expo-router';
// ... previous imports inside the component

  // Add touch handler on the info container to open details
  const handleOpenDetails = () => {
    router.push(`/proposal/${proposal.id}`);
  };

// Replace `<View style={styles.infoContainer}>` with:
// <TouchableOpacity style={styles.infoContainer} onPress={handleOpenDetails} activeOpacity={0.8}>
// ... (text components)
// </TouchableOpacity>
