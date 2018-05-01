import React, { Component } from "react";
import { View, Text, ActivityIndicator, Dimensions, StyleSheet, AsyncStorage, Button} from "react-native";
import { StackNavigator } from 'react-navigation';
import HomePageComponents from '../components/HomePageComponents.js';
import AwesomeButton from 'react-native-really-awesome-button';
import Icon from 'react-native-vector-icons/FontAwesome';

var height = Dimensions.get('window').height;

export default class HomePage extends React.Component {

  // To use local variables and functions, navigation.state has to be used.
  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state;

      return {
        title: "Equations",
        headerRight: <Button disabled={params.isSearching || false} title={params.buttonTitle || "Order"} onPress={() => params.editOrder()} color="#E73137" />
      };
  };

  // Set a parameter in navigation as a function to be used in the header button.
  componentWillMount() {
	if(this.props.navigation)  
		this.props.navigation.setParams({ editOrder: this._editOrder });
  }

  // This is neccaccary for the button in the header to be able to use the state variable.
  _editOrder = () => {

    // Set the button in the header.
    if(!this.state.isOrder) {
      this.props.navigation.setParams({ buttonTitle: "Done" });
    } else {
      this.props.navigation.setParams({ buttonTitle: null });
    }

    this.setState({ isOrder: !this.state.isOrder})
  }

  constructor(props) {
    super(props);

    var customData = require('../Model/Equations.json')
    const equations = customData["Equations"]

    this.state={
      equations: equations,
      order: null,
      filterOrder: null,
      isOrder: false,
      isSearching: false,
      isLoading: false,
      text: '',
      fav: null,
    }

    // The order is stored in index.
    this.setOrder()

    this.c = new HomePageComponents()
  }

  // Fetch the order from the locale storage. If there is none there, use standard.
  async setOrder() {
    var order = []
    try {
      const value = await AsyncStorage.getItem('@MySuperStore:equationOrder');
      if (value != null){
        order = JSON.parse(value)

        console.log(order.length)

        // Reset to default order if the equations are changed.
        if(order.length != Object.keys(this.state.equations).length) {
          order = Object.keys(this.state.equations)
        }

        console.log(order.length)
      } else {
        order = Object.keys(this.state.equations) // Array of keys, defaults
      }
    } catch (error) {
      order = Object.keys(this.state.equations) // Array of keys, defaults
    }

    this.setState({
      order: order,
      filterOrder: order
    })
  }

  test(text) {
    SearchFilterFunction(text)
  }

  SearchFilterFunction(text){
    const equations = this.state.equations
    const order = this.state.order

    // Filter the search text in the equation.
    var newData = equations.filter(function(item) {
        const itemData = item.name.toUpperCase()
        const textData = text.toUpperCase()
        return itemData.indexOf(textData) > -1
    })

    // Order the filtered equations with the order.
    result = []
    order.forEach(function(key) {
        var found = false;
        newData = newData.filter(function(item) {
            if(!found && item.id == key) {
                result.push(item);
                found = true;
                return false;
            } else
                return true;
        })
    })

    this.setState({
        filterOrder: result.map(a => String(a.id)), // Map to only get the id's
        text: text
    })

    // If searching, then disable filters
    if(text) {
      this.props.navigation.setParams({ isSearching: true});
      this.props.navigation.setParams({ buttonTitle: null });
      this.setState({
        isSearching: true,
        isOrder: false
      })
    } else {
      this.props.navigation.setParams({ isSearching: false});
      this.setState({
        isSearching: false
      })
    }
}

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.StateLoading}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.MainContainer}>
        <View style={{flexDirection: 'row', marginBottom: 3}}>
          <AwesomeButton style={styles.allButton} backgroundColor= '#B7B9B8'>
            <Icon name='tasks' color='#0C3F7D' style={{margin: '5%'}}/>
            <Text style={styles.a}>All</Text>
          </AwesomeButton>
          <AwesomeButton style={styles.favButton} backgroundColor= '#B7B9B8'>
            <Icon name='heart-o' color='#E73137' style={{margin: '5%'}}/>
            <Text style={styles.f}>Favorites</Text>
          </AwesomeButton>
        </View>
        {this.c.searchInput(this.state, this.SearchFilterFunction.bind(this), styles)}
        {this.c.equationSortList(this.state, this.onRowMoved.bind(this), this.onItemPress.bind(this), styles)}
      </View>
    );
  }

  onItemPress(equation) {
    this.props.navigation.navigate('Detail', {title: equation.name, equation});
  }

  async onRowMoved(e) {
    // Order the list
    const order = this.state.order
    order.splice(e.to, 0, order.splice(e.from, 1)[0])
    this.setState({
      order: order,
      filterOrder: order
    })

    // Store the order in local storage when row is moved.
    try {
      await AsyncStorage.setItem('@MySuperStore:equationOrder', JSON.stringify(this.state.order));
    } catch (error) {
      console.log("Fail to store equation order!")
    }
  }

}


const styles = StyleSheet.create({
  MainContainer : {
     justifyContent: 'center',
     flex:1,
     margin: 7,
     flexDirection: 'column'
   },

  listItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#2d85dd'
  },

  listTitle: {
    fontSize: 30,
    paddingTop: 10,
    paddingBottom: 10
  },

  TextInputStyleClass :{
   textAlign: 'center',
   height: 40,
   borderWidth: 1,
   borderColor: '#009688',
   borderRadius: 7 ,
   backgroundColor : "#FFFFFF"
  },

  StateLoading:{
    flex: 1,
    paddingTop: 20
  },

  listSubTitle:
  {
    fontSize: 15,
    color: 'gray'
  },
  allButton:
  {
    margin: 2,
    flex: 1, 
  },
  favButton:
  {
    margin: 2,
    flex: 1, 
  },
  a:
  {
    fontSize: 15,
    color: '#0C3F7D',
    margin: '5%'
  },
  f:
  {
    fontSize:15,
    color: '#E73137',
    margin: '5%'
  }
});
