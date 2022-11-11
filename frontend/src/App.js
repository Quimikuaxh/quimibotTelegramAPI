import logo from './logo.svg';
import './App.css';
import React from "react";

const axios = require('axios');
const FormData = require('form-data');
const data = new FormData();





function App() {
    const [pokemonList, setPokemonList] = React.useState([]);

    // Makes the API request to retrieve every pokemon
    React.useEffect(() => {
        axios.get('http://localhost:3001/api/v1/pokemon').then((response) => {
            setPokemonList(response.data);
        });
    }, []);

    // POKEMON MOCKED FOR DESIGN PURPOSES
    // React.useEffect(() =>{
    //     setPokemonList([{
    //         "name": "bulbasaur",
    //         "id": "1",
    //         "types": [
    //             "grass",
    //             "poison"
    //         ],
    //         "stats": {
    //             "hp": 45,
    //             "attack": 49,
    //             "defense": 49,
    //             "spAtk": 65,
    //             "spDef": 65,
    //             "speed": 45
    //         },
    //         "abilities": [
    //             "overgrow",
    //             "chlorophyll"
    //         ]
    //     }]);
    // }, []);


    if(!pokemonList) return null;
  return (
    <div className="App">
        {pokemonList.map(pokemon => generatePokemonCard(pokemon))}
    </div>

  );
}

function fillWithZero(id){
    return ('0000'+id).slice(-4);
}

function addActive(e) {
    let items = document.getElementsByClassName('active');

    if(items.length !== 0){
        items[0].classList.remove('active');
    }
    e.target.classList.add('active');
}


function generatePokemonCard(pokemon){
    return(
        <div class="pokemon-card" onClick={(e) => addActive(e)}>
            <p class="pokemon-id">#{fillWithZero(pokemon.id)}</p>
            <img className="pokemon-icon" src={`http://localhost:3001/images/icons/${pokemon.name}.png`}
                 alt={pokemon.name}></img>
            <p class="pokemon-name"> {pokemon.name}</p>

            <div class="types">
                {pokemon.types.map(type => {
                    return (<img class="type" src={`http://localhost:3001/images/types/${type}.png`} alt={type}></img>)
                })}
            </div>
        </div>
    )
}

export default App;
