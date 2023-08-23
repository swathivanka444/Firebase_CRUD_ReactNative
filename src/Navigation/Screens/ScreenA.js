import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
const ScreenA = ({ navigation, route }) => {
  const { params } = route;
  const [dataList, setDataList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per pag
  const [getDoc, setGetDoc] = useState("");
  useEffect(() => {
    // if (params && params.name && params.email && params.phoneNumber && params.selectedCameraImages && params.selectedImages) 
    // {
    //   setDataList(prevDataList => [
    //     ...prevDataList,
    //     {
    //       name: params.name,
    //       email: params.email,
    //       phoneNumber:params.phoneNumber,
    //       selectedCameraImages: params.selectedCameraImages,
    //       selectedImages:params.selectedImages
    //     },
    //   ]);
    // }
    getUser();
  }, [params]);
  const getUser = async () => {
    try {
      const userDocument = await firestore().collection("users").get();
      console.log("userDocument", userDocument);
      setGetDoc(userDocument);
    }
    catch (err) {
      console.log("error**", err)
    }
  }
  // useEffect(()=>{
  //  getUser();
  // },[])
  const navigateToScreenB = () => {
    navigation.navigate('Details');
  };

  const renderPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;   // Calculate the starting index for the current page
    const endIndex = startIndex + itemsPerPage;         // Calculate the ending index for the current page
    console.log("getDoc---", getDoc);
    console.log("getDoc._docs", getDoc._docs)
    return getDoc?._docs?.slice(startIndex, endIndex);     // Return the subset of dataList within the calculated index range
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const updateData = async () => {
    try {
      const token = 'OC3UShOvXB8NFWGmuNCQ';
      const userUpdateDocument = firestore().collection("users").doc(token);
      console.log("userUpdateDocument", userUpdateDocument);
      userUpdateDocument.update({
        name,
        email,
        phoneNumber,
        url

      })
      console.log("Document successfully updated!");
    }
    catch (err) {
      console.log("UpdationError", err)
    }
  }

  const deleteData = (id) => {
    console.log('id----------',id)
    firestore()
      .collection('users')
      .doc(id)
      .delete()
      .then(() => {
        console.log('User deleted!');
      });
  }
  const navigateToScreenBUpdate = () => {
    navigation.navigate('Details', { item });
  }
  const renderItem = ({ item }) => {
    console.log("item**", item)
    return (
      <View style={styles.itemContainer}>
        <View style={styles.imageContainer}>

          {/* <Image
            key={index}
            source={{ uri: `data:image/jpeg;base64,${image.base64}` }}
            style={styles.image}
          /> */}
          <Image source={{ uri: item._data.url }} style={styles.image} />


          {/* <Text>Hello</Text> */}
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.text}>{item._data.name}</Text>
          <Text style={styles.text}> {item._data.email}</Text>
          <Text style={styles.text}> {item._data.phoneNumber}</Text>
        </View>
        <View>
          <TouchableOpacity

            onPress={() => navigation.navigate('Details', { item })}
          >
            <Icon name="edit" size={16} color="green" />
          </TouchableOpacity>
          <TouchableOpacity

          onPress={() =>deleteData(item._ref._documentPath._parts[1]) }
          >
            <Icon name="trash" size={16} color="red" style={{ marginTop: 20 }} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }



  return (
    <View style={styles.container}>
      <FlatList
        // data={dataList}
        data={renderPaginatedData()}

        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContainer}
      />
      <View style={styles.paginationContainer}>
        {Array.from({ length: Math.ceil(getDoc?._docs?.length / itemsPerPage) }).map(
          (_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationButton,
                currentPage === index + 1 && styles.activeButton,
              ]}
              onPress={() => handlePageChange(index + 1)}
            >
              <Text style={[styles.buttonTextt, styles.blackText]}>{index + 1}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={navigateToScreenB}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 16,
  },
  flatListContainer: {
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#DA2517',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 110,

  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },


  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the middle
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 10,
    height: 100
  },
  imageContainer: {
    marginRight: 16, // Add spacing between image and details
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 5,
    // alignItems:'center',
    // justifyContent:"center",
    marginTop: 43,
    // marginRight:15
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationButton: {
    width: 30,
    height: 30,
    padding: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#ccc',
  },
  blackText: {
    color: 'black',
  },
  buttonTextt: {
    fontSize: 11,
  },

})

export default ScreenA;