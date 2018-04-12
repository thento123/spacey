import React, { Component } from "react";
import { View, Text, TextInput, Button} from "react-native";

export default class DetailPage extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
  });

  constructor(props) {
    super(props);

    this.equation = props.navigation.state.params.equation

    this.state={
      parameterArray: Array(this.equation.parameters.length).fill(""),
      parametersValidation: Array(this.equation.parameters.length).fill(""),
      calculateResult: "Fill in values & calculate!"
    }
  }

  render() {

    let payments = [];
    for(let i = 0; i < this.equation.parameters.length; i++){
      payments.push(
        <View key={i}>
          <Text>{this.equation.parameters[i]}</Text>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(text) => this.onParametersInput(i, text)}
            value={this.state.parameterArray[i]}
            keyboardType={'numeric'}
          />
          {!!this.state.parametersValidation[i] && (
            <Text style={{color: 'red'}}>{this.state.parametersValidation[i]}</Text>
          )}
        </View>)
    }

    return (
      <View>
        <Text>{this.equation.name}</Text>
        <Text>{this.equation.description}</Text>
        <Text>{this.equation.equation}</Text>

        <View style={{paddingVertical: 16, paddingHorizontal: 8}}>
          {payments}
        </View>

        <Text>{this.state.calculateResult}</Text>

        <Button
          onPress={ () => this.onCalculatePress()}
          title="Calculate"
        />
      </View>
    )
  }

  onParametersInput(index, text) {
    const parameterArray = this.state.parameterArray
    const parametersValidation = this.state.parametersValidation
    parameterArray[index] = text

    if (parameterArray[index] === "") { // Empty
      parametersValidation[index] = "Required field."
    } else if (!(/^\d+$/.test(parameterArray[index]))){ // Number check.
      parametersValidation[index] = "Only numbers."
    } else {
      parametersValidation[index] = ""
    }

    this.setState({
      parameterArray,
      parametersValidation
    })
  }


  onCalculatePress() {

    // Check for empty inputs.
    if(this.checkEmptyInputs()) {
      console.log("Empty Inputs!")
      this.updateCalculateReulsts("Values in the input(s) is required.")

      return
    }

    // Check if the all the parameter validations are OK
    if(this.state.parametersValidation.join('')) {
       console.log("Validation not OK!")
       this.updateCalculateReulsts("Put it correct inputs.")

       return
    }

    let calculateResult = ""

    // Loop through the parameters and add expression in between.
    for(let i = 0; i < this.state.parameterArray.length; i++){
      if(this.state.parameterArray.length == 1) { // One parameter
        calculateResult += this.state.parameterArray[i] + this.equation.expressions[i]
      } else if (i == this.state.parameterArray.length-1) { // Check if the last parameter, then don't add an expression
        calculateResult += this.state.parameterArray[i]
      } else {
        calculateResult += this.state.parameterArray[i] + this.equation.expressions[i]
      }
    }

    this.updateCalculateReulsts(eval(calculateResult))
  }

  updateCalculateReulsts(calculateResult) {
    this.setState({
      calculateResult
    })
  }

  // Loop through the inputs, if it finds some empty Strings, return true.
  // Also add parametersValidation text to that parameter.
  checkEmptyInputs() {

    let bool = false
    const parametersValidation = this.state.parametersValidation
    for(let i = 0; i < this.state.parameterArray.length; i++){
      if (this.state.parameterArray[i] === "") {
        parametersValidation[i] = "Required field."
        bool = true
      }
    }

    this.setState({
      parametersValidation
    })

    return bool
  }

}