import * as React from 'react';
import {Platform, Text, View, StyleSheet, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import RNFetchBlob from 'rn-fetch-blob';

export default function App() {
  const [recording, setRecording] = React.useState();
  const speak = () => {
    const thingToSay = 'Hello you, what is your name?';
    Speech.speak(thingToSay);
  };

  async function postFileToAPI(fileUri) {
    try {
      const formData = new FormData();
  
      // Get file type and name
      const fileTypeMatch = /\.([a-zA-Z]+)$/i.exec(fileUri);
      const fileType = fileTypeMatch ? fileTypeMatch[1] : 'unknown';
      const fileName = `file.${fileType}`;
  
      // Handle the file differently based on the platform
      let file = {};
      if (Platform.OS === 'ios') {
        file = {
          uri: fileUri,
          type: `image/${fileType}`,
          name: fileName,
        };
      } else {
        // Android requires using RNFetchBlob to get the file data
        const fileData = await RNFetchBlob.fs.readFile(fileUri, 'base64');
        file = {
          uri: `data:image/${fileType};base64,${fileData}`,
          type: `image/${fileType}`,
          name: fileName,
        };
      }
  
      formData.append('file', file);
  
      const response = await fetch('https://your-rest-api-url.com/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const responseData = await response.json();
      console.log('File uploaded successfully:', responseData);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }


  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    response = postFileToAPI(uri);
    console.log("API response: ", response)
  }

  return (
    <View style={styles.recordButtonSection}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      <Button
        title='Speak'
        onPress={speak}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    recordButtonSection: {
       width: '100%',
       height: '30%',
       justifyContent: 'center',
       alignItems: 'center'
    }
}); 