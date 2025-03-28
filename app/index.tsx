import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import { Button, Modal, Portal, Provider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";

type Weather = {
  coord: {
    lat: number;
    lon: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    pressure: number;
    humidity: number;
  };
  name: string;
};

export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);

  const [data, setData] = useState<Weather | null>(null);

  const apiKey = process.env.EXPO_PUBLIC_API_KEY;

  useEffect(() => {
    const changeOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    changeOrientation();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      getWeather(location.coords.latitude, location.coords.longitude);
    };
    getLocation();
  }, []);

  const getWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const json = await response.json();
      setData(json);
    } 
    catch (error) {
      console.error(error);
    }
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        {initialRegion ? (
          <>
            <MapView style={styles.map} region={initialRegion}>
              {currentLocation && (
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="You are here!"
                />
              )}
            </MapView>
            <View style={styles.buttonContainer}>
              <Button 
                style={styles.button} 
                labelStyle={styles.buttonText} 
                mode="contained" 
                onPress={showModal}>
                Show weather
              </Button>
            </View>
            <Portal>
              <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {data && ( 
                    <>
                    <Text style={styles.modalText}>Place: {data.name}</Text>
                    <Text style={styles.modalText}>Latitude: {data.coord.lat}°</Text>
                    <Text style={styles.modalText}>Longitude: {data.coord.lon}°</Text>
                    <Text style={styles.modalText}>Temp: {data.main.temp}°C</Text>
                    <Text style={styles.modalText}>Pressure: {data.main.pressure} hPa</Text>
                    <Text style={styles.modalText}>Humidity: {data.main.humidity}%</Text>
                    <Text style={styles.modalText}>Description: {data.weather[0].description}</Text>
                    </>
                  )}
                </View>
                <Button
                  style={styles.button} 
                  labelStyle={styles.buttonText} 
                  mode="contained" 
                  onPress={hideModal}>
                  Close
                </Button>
              </Modal>
            </Portal>
          </>
        ) : (
          <View style={styles.loadingContainer}>{}</View>
        )}
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#f5e942",
  },
  buttonText: {
    color: "black",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    maxWidth: 400,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  modalContent: {
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
});