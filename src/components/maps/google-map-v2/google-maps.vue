<template>
  <div id="maps"></div>
</template>

<script>
let GOOGLE_MAPS;
window.googleMapsState = {
  isReady: false,
};
window.initMap = function () {
  GOOGLE_MAPS = google;
  window.googleMapsState.isReady = true;
};

export default {
  name: 'google-maps',
  props: {
    searchBoxId: {
      type: String,
      required: true,
    },
    latLong: {
      type: Object,
      required: false,
    },
    scriptGoogleMap: {
      required: false,
    },
  },
  data() {
    return {
      googleMapsState: window.googleMapsState,
      googleMaps: '',
    };
  },
  watch: {
    'googleMapsState.isReady'(newValue) {
      this.googleMaps = GOOGLE_MAPS;
      this.build();
    },
  },
  mounted() {
    if (!this.scriptGoogleMap) {
      this.loadGoogleMapsScript();
    } else {
      this.build();
    }
  },
  methods: {
    build() {
      const vm = this;
      const location_marker = {};
      const location =
        this.latLong && Object.keys(this.latLong).length ? this.latLong : { lat: -6.212329, lng: 106.848874 };
      const map = new GOOGLE_MAPS.maps.Map(document.getElementById('maps'), {
        zoom: 12,
        center: location,
        mapTypeId: 'roadmap',
      });

      // Create the search box and link it to the UI element.
      const input = document.getElementById(this.searchBoxId);
      const searchBox = new GOOGLE_MAPS.maps.places.SearchBox(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
      });

      let markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function () {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new GOOGLE_MAPS.maps.LatLngBounds();
        places.forEach(function (place) {
          if (!place.geometry) {
            console.log('Returned place contains no geometry');
            return;
          }

          const icon = {
            url: 'https://s3-ap-southeast-1.amazonaws.com/img-sociolla/sociolla_pin_point_2.svg',
          };

          const marker_reference = new GOOGLE_MAPS.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            draggable: true,
          });

          // Create a marker for each place.
          markers.push(marker_reference);

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }

          GOOGLE_MAPS.maps.event.addListener(marker_reference, 'dragend', function () {
            vm.$emit('placesChanged', {
              lat: marker_reference.getPosition().lat(),
              lng: marker_reference.getPosition().lng(),
            });
          });

          location_marker.lat = place.geometry.location.lat();
          location_marker.lng = place.geometry.location.lng();
          vm.$emit('placesChanged', {
            lat: location_marker.lat,
            lng: location_marker.lng,
          });
        });
        map.fitBounds(bounds);
      });

      const default_marker = new GOOGLE_MAPS.maps.Marker({
        position: location,
        icon: 'https://s3-ap-southeast-1.amazonaws.com/img-sociolla/sociolla_pin_point_2.svg',
      });

      // To add the marker to the map, call setMap();
      default_marker.setMap(map);
      markers.push(default_marker);

      this.$emit('getMap', map);
    },
    loadGoogleMapsScript() {
      const id = 'googleMapScript';
      const googleMapTag = document.getElementById(id);

      if (!googleMapTag) {
        const js = document.createElement('script');

        js.id = id;
        js.type = 'text/javascript';
        js.src =
          'https://maps.googleapis.com/maps/api/js?key=AIzaSyARdo3Ne0pwFgtY3cbNsX9kO7KT22bFqCM&callback=initMap&libraries=places';

        document.body.appendChild(js);
        this.$emit('setScriptGoogleMap', js);
      } else {
        this.$emit('setScriptGoogleMap', googleMapTag);
        this.build();

        console.log('here');
      }
    },
  },
};
</script>

<style>
/* Set the size of the div element that contains the map */
#maps {
  height: 400px; /* The height is 400 pixels */
  width: 100%; /* The width is the width of the web page */
  margin: 20px 0;
}
</style>
