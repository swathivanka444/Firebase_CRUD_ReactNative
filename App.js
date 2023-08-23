
import React from 'react';
import {View,Text} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScreenA from './src/Navigation/Screens/ScreenA';
import ScreenB from './src/Navigation/Screens/ScreenB';
const App=()=>{
  const Stack=createStackNavigator();
  return(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Listings" component={ScreenA}/>
        <Stack.Screen name="Details" component={ScreenB}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  )
}
export default App;