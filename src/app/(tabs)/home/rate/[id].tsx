import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { teachers } from "@assets/data/teachers";

const RateTeacher = () => {
  const { id } = useLocalSearchParams();
  const teacher = teachers.find((item) => item.id === id)

  return (
    <View>
      <Stack.Screen options={{ title: `Rate ${teacher?.name}` }} />
      <Text>Rate Teacher Page - ID: {id}</Text>
      {/* Add Rating UI here */}
    </View>
  );
};

export default RateTeacher;
