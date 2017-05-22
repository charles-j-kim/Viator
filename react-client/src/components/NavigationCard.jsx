import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import MapNavigation from 'material-ui/svg-icons/maps/navigation';
import MapsPlace from 'material-ui/svg-icons/maps/place';
import Avatar from 'material-ui/Avatar';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Divider from 'material-ui/Divider';
import {
  grey500, white, deepPurple500,
} from 'material-ui/styles/colors';
import GoogleMapReact from 'google-map-react';
import FlatButton from 'material-ui/FlatButton';
import $ from 'jquery';
import config from '../../../server/config.js';
const uberBar = './uberImage.png';
const mapPin = './mapPin.png';
const uberLogo = './uberlogo.png';


const AnyReactComponent = ({  img_src }) => <div><img src={mapPin}/></div>;

class NavigationCard extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      price: '',
      markers: [{lat: 37.8044, lng: -122.2711},{lat: 37.7749, lng: -122.42}],
      geoLocations: {},
      currentPosition: "",
      airport: false
     }

    this.getPriceEstimates = this.getPriceEstimates.bind(this);
    this.getGeoCoord = this.getGeoCoord.bind(this);

  }

    getPriceEstimates(airport, destination) {
      var data = JSON.stringify({
         start_latitude: airport.lat,
         start_longitude: airport.lng,
         end_latitude: destination.lat,
         end_longitude: destination.lng
       });
       console.log(data);
      $.ajax({
        type: 'POST',
        url: '/estimates/price',
        headers: {
          Authorization: config.UBER_SERVER_TOKEN
        },
        contentType: 'application/json',
        data: data,
        success: (data) => {
          this.setState({price: data});
        },
        error: function() {
          console.log("error!")
        }
      })
    }

  componentDidMount() {

  }

  componentWillReceiveProps() {
    if (this.props.destination && this.props.arrivalPort) {

      this.getGeoCoord(this.props.destination, 'destination');
      this.getGeoCoord(this.props.arrivalPort, 'airport');

    }

  }


  getGeoCoord(position, dest) {
    var context = this;
    if (!!context.state.geoLocations[position]) {
      return context.state.geoLocations[position]
    } else if (position !== undefined){
      $.ajax({
        type: 'GET',
        url: '/geoCoord',
        contentType: 'application/json',
        data: {position: position.replace(/[ ]+/g, "+").trim()},
        dataType: 'text',
        success: (data) => {
          context.setState({currentPosition: position});
          let aObj = {};
          aObj[position] = JSON.parse(data);
          var currentGeoObj = context.state.geoLocations;
          context.setState({geoLocations: Object.assign(currentGeoObj,aObj) })
        },
        fail: (data) => {
          console.log('dash.getGeoCoord FAIL ', err)
        }
      })
      .done(function(data) {
        let position = context.state.currentPosition;
        let arrivalObj = {};
        let currentGeoState = context.state.geoLocations;
        arrivalObj[position] = data;
        context.setState({geoLocations: Object.assign(currentGeoState, arrivalObj)}, function() {
          let setMarkers = context.state.markers
          if ( dest === 'airport') {
            setMarkers[0] = JSON.parse(data)
            context.setState({ markers: setMarkers })   ////[ geoinfo_airport, geoinfo_destination
          } else if( dest === 'destination') {
            setMarkers[1] = JSON.parse(data)
            context.setState({ markers: setMarkers })
          }
        })

        context.getPriceEstimates(context.state.markers[0] || {lat:0,lng:0}, context.state.markers[1] || {lat:0,lng:0});

        return data;
      })
    }
}

  geoLocation(position) {
    var context = this;
    if ( this.state.geoLocations[position]) {
      return this.state.geoLocations[position]
    }
    else {
      this.getGeoCoord(position)
    }
  }

  render() {
    const styles = {
          card: {
            width: '100%',
            height: 400,
          },
          avatar: {
            backgroundColor: deepPurple500,
          },
          cardHeader: {
            height: '20%',
          },
          map: {
            height: '60%',
          },
          actions: {
            height: '20%',
          }
        }

    const priceStyle = {
      textAlign: 'right',
      width: '300',
      height: '44',
      margin: 'auto'
    }

    return (
      <div>
        <Card
          style={styles.card}>
          <CardHeader

              title={`Navigation from ${this.props.arrivalPort}`}
              subtitle={this.props.destination}
              avatar={<Avatar icon={<MapNavigation />}
                style={styles.avatar}
                color={white}/>}
              style={styles.cardHeader}/>
              <Divider/>
               <div
                style={styles.map}>
                <GoogleMapReact
                  bootstrapURLKeys={{key: config.STATIC_MAP}}
                  center={this.state.markers[0],this.state.markers[1]}
                  zoom={10}
                >

                  {this.state.markers.length === 2 && this.state.markers.map((marker, i) =>{
                  return(

                      <AnyReactComponent
                        key={i}
                        lat={marker.lat}
                        lng={marker.lng}
                        img_src={marker.img_src}
                      />
                    )
                  })}
                </GoogleMapReact>
              </div>
              <CardHeader
                title={'Price Estimate: '} 
                subtitle={this.state.price}
                avatar={uberLogo} 

              />
        </Card>
      </div>
    )
  }
}

export default NavigationCard;
