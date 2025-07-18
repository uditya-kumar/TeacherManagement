import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { teachers } from "@assets/data/teachers";

const ViewTeacherDetails = () => {
  const { id } = useLocalSearchParams();
  const teacher = teachers.find((item) => item.id === id);

  return (
    <View>
      
      <Text>View Teacher Details - ID: {id}</Text>
      {/* Add detailed info UI here */}
    </View>
  );
};

export default ViewTeacherDetails;
