import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ShortsScreen from './screens/ShortsScreen';
import RewardScreen from './screens/RewardScreen';
import ProfileScreen from './screens/ProfileScreen';
import {Image} from 'react-native';

// Define the type for route params
export type RootTabParamList = {
  Home: undefined;
  Shorts:
    | {
        videoUrl: string;
        currentTime: number;
      }
    | undefined;
  Reward: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          // Define the icons for each tab based on the route name.
          tabBarIcon: ({focused, color, size}) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Shorts') {
              iconName = require('./assets/credit-card.png');
            } else if (route.name === 'Reward') {
              iconName = require('./assets/gift.png');
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }
            return route.name === 'Shorts' || route.name === 'Reward' ? (
              <Image
                source={iconName}
                style={{width: 24, height: 24, tintColor: color}}
              />
            ) : (
              <Icons name={iconName} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'black',
          },
        })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Shorts" component={ShortsScreen} options={{}} />
        <Tab.Screen name="Reward" component={RewardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
