import React, { useState, useEffect, } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Modal, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import PhoneInput from 'react-native-phone-number-input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';
const ScreenB = ({ navigation, }) => {
    const route = useRoute();
    const dataReceived = route && route.params && route.params?.item ?route.params?.item:'';
    const token = route && route.params && route.params?.item && route.params?.item._ref && route.params?.item._ref._documentPath && route.params?.item._ref._documentPath._parts ? route.params?.item._ref._documentPath._parts[1] :''; 
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedCameraImages, setSelectedCameraImages] = useState([]);
    const [nameErrorMessage, setNameErrorMessage] = useState('');
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [numberErrorMessage, setNumberErrorMessage] = useState('');

    const [modalVisible, setModalVisible] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(null);
    useEffect(() => {
        if (route && route.params) {
            
            console.log("dataReceived", token);
            console.log("dataReceivedName", dataReceived._data.name)
            console.log("dataReceivedEmail", dataReceived._data.email)
            console.log("dataReceivedphoneNumber", dataReceived._data.phoneNumber)
            setName(dataReceived._data.name);
            setEmail(dataReceived._data.email);
            setPhoneNumber(dataReceived._data.phoneNumber)
        }

    }, [])
    // const launchNativeCamera = () => {
    //     let options = {
    //         includeBase64: true,
    //         storageOptions: {
    //             skipBackup: true,
    //             path: 'images',
    //         },
    //     };
    //     launchCamera(options, (response) => {
    //         if (response.didCancel) {
    //             console.log('User cancelled image picker');
    //         } else if (response.errorCode) {
    //             console.log('ImagePicker Error: ', response.errorMessage);
    //         } else {
    //             const newSelectedImages = response.assets.map((asset) => ({
    //                 base64: asset.base64,
    //                 uri: asset.uri,
    //             }));
    //             setSelectedCameraImages([...selectedCameraImages, ...newSelectedImages]);
    //         }
    //     });
    // };
    const launchNativeCamera = () => {
        let options = {
            includeBase64: true,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                const newSelectedImage = {
                    base64: response.assets[0].base64,
                    uri: response.assets[0].uri,
                };
                setSelectedCameraImages([newSelectedImage]);
            }
        });
    };

    // const launchNativeImageLibrary = () => {
    //     let options = {
    //         includeBase64: true,
    //         multiple: false, // Enable multiple selection
    //         cropping: true,
    //         storageOptions: {
    //             skipBackup: true,
    //             path: 'images',
    //         },
    //     };
    //     launchImageLibrary(options, (response) => {
    //         console.log('Response = ', response);

    //         if (response.didCancel) {
    //             console.log('User cancelled image picker');
    //         } else if (response.errorCode) {
    //             console.log('ImagePicker Error: ', response.error);
    //         } else {
    //             const newSelectedImages = response.assets.map((asset) => ({
    //                 base64: asset.base64,
    //                 uri: asset.uri,
    //             }));
    //             setSelectedImages([...selectedImages, ...newSelectedImages]);
    //         }
    //     });
    // };
    const launchNativeImageLibrary = () => {
        let options = {
            includeBase64: true,
            cropping: true,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        launchImageLibrary(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                const selectedImage = {
                    base64: response.assets[0].base64,
                    uri: response.assets[0].uri,
                };
                setSelectedImages([selectedImage]);
            }
        });
    };

    const submitData = async () => {
        console.log("vhjvjvjvhj", selectedImages)
        //cloud storage
        let urls = '';
        let uploadUri = ''
        if (selectedImages && selectedImages.length > 0) {
            uploadUri = selectedImages[0].uri;
            console.log("uploadUriIF***")
        } else {
            urls = dataReceived._data.url;
            console.log("uploadUriELSE***",urls)
        }

        if (token)
         {
            console.log("uploadUriIFToken***")
            if (selectedImages && selectedImages.length > 0 && typeof uploadUri === 'string') {
                const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

                try {
                    await storage().ref(filename).putFile(uploadUri).then((res) => {
                        // console.log("response",res.metadata.fullPath)
                        console.log("response", res);
                        const resData = res && res.metadata && res.metadata.fullPath;
                        console.log("resData", resData);
                        const getUrl = storage().ref(resData).getDownloadURL()
                            .then((url) => {
                                console.log("getUrl***", url)
                                const updateUserDocument = firestore().collection("users").doc(token)
                                updateUserDocument.update({
                                    name:name,
                                    email:email,
                                    phoneNumber:phoneNumber,
                                    url:url            })
                                    .then((res) => {
                    
                                        console.log("Data upate successfuly", res)
                                    })
                                  .catch((err)=>{
                                    console.log("err")
                                  })
                            })
                    });

                    setUploading(false);

                    // Alert.alert('Image uploaded', 'Your image has been uploaded to Firebase Cloud Storage successfully');
                } catch (err) {
                    console.log(err);
                }
                
            }else{
                const updateUserDocument = firestore().collection("users").doc(token)
                updateUserDocument.update({
                    name:name,
                    email:email,
                    phoneNumber:phoneNumber,
                    url:urls           
                 })
                    .then((res) => {
    
                        console.log("Data upate successfuly", res)
                    })
                  .catch((err)=>{
                    console.log("err")
                  })
            }

         
        } else {
            console.log("uploadUriIFElse***")
            if (typeof uploadUri === 'string') {
                const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1); //get last part of the string
                setUploading(true);
                try {
                    await storage().ref(filename).putFile(uploadUri).then((res) => {
                        // console.log("response",res.metadata.fullPath)
                        console.log("response", res);
                        const resData = res && res.metadata && res.metadata.fullPath;
                        console.log("resData", resData);
                        const getUrl = storage().ref(resData).getDownloadURL()
                            .then((url) => {
                                console.log("getUrl***", url)
                                firestore()
                                    .collection('users')
                                    .add({
                                        name,
                                        email,
                                        phoneNumber,
                                        url
                                    })
                                    .then(() => {
                                        console.log('User added!');
                                    });

                            })



                    });

                    setUploading(false);

                    // Alert.alert('Image uploaded', 'Your image has been uploaded to Firebase Cloud Storage successfully');
                } catch (err) {
                    console.log(err);
                }
                //   setSelectedImages(null);
            } else {
                console.error('Invalid selectedImages:', selectedImages);
                // Handle the case where selectedImages is not a valid string.
            }
        }





        let hasErrors = false;

        if (name.trim() === '') {
            setNameErrorMessage('Please enter a valid name');
            hasErrors = true;
        } else if (!/^[A-Za-z]+$/.test(name)) {
            setNameErrorMessage('Name should only contain letters');
            hasErrors = true;
        } else {
            setNameErrorMessage('');
        }

        if (email.trim() === '' || !email.includes('@')) {
            setEmailErrorMessage('Please enter a valid email');
            hasErrors = true;
        } else {
            setEmailErrorMessage('');
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setNumberErrorMessage('Please enter a valid 10-digit phone number');
            hasErrors = true;
        } else {
            setNumberErrorMessage('');
        }

        if (hasErrors) {
            return; // Don't submit if there are errors
        }
        // console.log('************************Submitting data:', { name, email, selectedCameraImages });
        navigation.navigate('Listings', { name, email, phoneNumber, selectedCameraImages: selectedCameraImages, selectedImages });


    };
    return (
        <KeyboardAwareScrollView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior for Android or iOS
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25} // Adjust offset as needed
        >
            <View style={{ padding: 20, backgroundColor: "white", margin: 30, borderRadius: 10, shadowColor: '#000000', elevation: 5 }}>

                {/* <Image
                    source={{
                        uri: 'https://t3.ftcdn.net/jpg/02/24/60/00/360_F_224600069_W7lxO3jE7CZ5s3izuhIoK5uSrDUz9x6W.jpg'
                    }}
                    style={{ height: 150, borderRadius: 5, marginBottom: 15, }}
                /> */}
                {
                    selectedImages.length > 0 ?
                        selectedImages.map((image, index) => (
                            <Image key={index} source={{ uri: image.uri }} style={{ height: 150, borderRadius: 5, marginBottom: 15, }} />
                        )) : dataReceived && dataReceived._data && dataReceived._data.url ? (
                            <Image source={{ uri: dataReceived._data.url }} style={{ height: 150, borderRadius: 5, marginBottom: 15, }} />
                        ) : <></>

                }
                {/* {selectedImages.map((image, index) => (
                    <Image key={index} source={{ uri: image.uri }} style={{ height: 150, borderRadius: 5, marginBottom: 15, }} />
                ))} */}
                {/* {selectedCameraImages.map((image, index) => (
                    <Image key={index} source={{ uri: image.uri }} style={{ height: 150, borderRadius: 5, marginBottom: 15, }} />
                ))} */}

                <View style={styles.containerTwo}>
                    <TextInput
                        placeholder="Upload Images...."
                        style={styles.inputText}
                    />
                    <View style={styles.iconContainer}>
                        {/* <TouchableOpacity style={styles.iconButton} onPress={() => { launchNativeCamera() }}>
                            <Icon name="camera" size={16} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => { launchNativeImageLibrary() }}>
                            <Icon name="image" size={16} color="black" />
                        </TouchableOpacity> */}


                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Icon name="upload" size={16} color="black" />
                        </TouchableOpacity>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <TouchableOpacity
                                        style={styles.modalIconButton}
                                        onPress={() => {
                                            launchNativeCamera();
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Icon name="camera" size={20} color="black" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalIconButton}
                                        onPress={() => {
                                            launchNativeImageLibrary();
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Icon name="image" size={20} color="black" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>

                </View>
                <View style={styles.selectedImagesContainer}>
                    {/* {selectedImages.map((image, index) => (
                        <Image key={index} source={{ uri: image.uri }} style={styles.images} />
                    ))} */}
                    {/* {selectedImages && <Image source={{ uri: selectedImages }} style={{ width: 200, height: 200 }} />} */}

                    {/* {selectedCameraImages.map((image, index) => (
                        <Image key={index} source={{ uri: image.uri }} style={styles.images} />
                    ))} */}
                </View>

                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.asterisk}>*</Text>
                </View>
                <TextInput
                    style={styles.inputText}
                    value={name}
                    onChangeText={setName}
                    placeholder='Enter Name'
                />
                {nameErrorMessage !== '' && (<Text style={{ color: 'red', marginLeft: 5, marginBottom: 7 }}>{nameErrorMessage}</Text>)}
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.asterisk}>*</Text>

                </View>
                <TextInput
                    style={styles.inputText}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='Enter Email'
                />
                {emailErrorMessage !== '' && (<Text style={{ color: 'red', marginLeft: 5, marginBottom: 7 }}>{emailErrorMessage}</Text>)}
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Phone Number</Text>
                    <Text style={styles.asterisk}>*</Text>
                </View>
                <PhoneInput
                    placeholder={"Enter mobile number"}
                    defaultCode="IN"
                    layout="first"
                    defaultValue={phoneNumber ? phoneNumber : route && route.params && route.params.item ? route.params.item._data.phoneNumber : ''}
                    value={phoneNumber ? phoneNumber : route && route.params && route.params.item ? route.params.item._data.phoneNumber : ''}

                    onChangeText={(text) => {
                        setPhoneNumber(text);
                        // submitData(text)

                    }}
                    // onChangeText={setPhoneNumber}
                    textInputProps={{
                        placeholderTextColor: "#A7A0A0",
                        fontFamily: "Inter-Regular",
                        fontSize: 14,
                    }}
                    withShadow
                    containerStyle={[styles.phoneInputStyle]}
                    textInputStyle={styles.phoneInputStyle}
                    textContainerStyle={styles.phoneInputStyle}
                />
                {numberErrorMessage !== '' && (<Text style={{ color: 'red', marginLeft: 5, marginBottom: 9, marginTop: 5 }}>{numberErrorMessage}</Text>)}
                <TouchableOpacity style={styles.button} onPress={submitData}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    )
}
const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
    },
    label: {
        fontWeight: '600',
        marginBottom: 5,
    },
    asterisk: {
        color: 'red',
        marginLeft: 2,
        fontSize: 16,
    },
    containerTwo: {
        // flex: 1,
        // padding: 20,
    },
    inputText: {
        borderWidth: 1,
        // margin:30,
        height: 40,
        borderRadius: 5,
        borderColor: "#A7A0A0",
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#DA2517',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 100,
        marginTop: 13,

    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    iconContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        right: 10,
        bottom: 19,
    },
    iconButton: {
        padding: 5,

    },
    images: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 5
    },
    selectedImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // marginBottom: 10,
    },
    phoneInputStyle: {
        height: 50,
        borderRadius: 5,
        width: "100%",
        backgroundColor: "white",
        alignItems: "center",
    },

    uploadButton: {
        backgroundColor: '#f2f2f2',
        padding: 7,
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: "#f2f2f2"
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: 200,
    },
    modalIconButton: {
        padding: 10,
    },
})


export default ScreenB;