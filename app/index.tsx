import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";
import { Button } from "react-native-paper";

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

  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Weather[]>([]);

  const apiKey = process.env.API_KEY;

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
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const json = await response.json();
      setData(json.weather);
      console.log(JSON.stringify(json))
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => console.log("Button Pressed")}>
              Show weather
            </Button>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>{}</View>
      )}
    </View>
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
  }
});