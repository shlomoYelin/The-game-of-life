import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  Board_size = 6;
  //Generate the board 
  Board = Array.from(
    { length: this.Board_size }, (_, i) => Array.from({ length: this.Board_size }, (_, j) => false)
  );
  Is_stable_state!: boolean
  Game_rules: Rules = Rules.original
  Initial_amount_live_cells = Initial_amount_live_cells_options.Low
  Lives_neighbors_count = 0;
  GenerationInterval: any
  Delay = 2000

  constructor() { }

  ngOnInit(): void { }

  Get_cell_style() {
    return 3500 / (this.Board_size * this.Board_size) + 'px';
  }

  Start_game() {
    clearInterval(this.GenerationInterval);
    this.First_generation();
    this.GenerationInterval = setInterval(async () => await this.New_generation(), this.Delay)
  }

  Cellls_number_change(val: string) {
    clearInterval(this.GenerationInterval);
    this.Board_size = parseInt(val);
    //Update the board
    this.Board = Array.from(
      { length: this.Board_size }, (_, i) => Array.from({ length: this.Board_size }, (_, j) => false)
    );
    this.Start_game();
  }

  Rules_change(val: string) {
    this.Game_rules = (<any>Rules)[val];
    this.Start_game();
  }

  Initial_amount_live_cells_change(val: string) {
    this.Initial_amount_live_cells = (<any>Initial_amount_live_cells_options)[val];
    this.Start_game();
  }

  Delay_cells_change(val: string) {
    clearInterval(this.GenerationInterval);
    if (parseInt(val) != -1) {// -1 -> user choose stop
      this.Delay = parseInt(val)
      this.GenerationInterval = setInterval(async () => await this.New_generation(), this.Delay)
    }

  }

  First_generation() {
    const Lives_cells = this.Get_Lives_cells_num();
    this.Board.map((row, i) => row.map((_, j) => { this.Board[i][j] = false }))//set false for all cells
    for (let i = 0; i < Lives_cells; i++) {
      const Row_index = this.RandomInteger(0, this.Board_size - 1)
      const Columm_index = this.RandomInteger(0, this.Board_size - 1)
      this.Board[Row_index][Columm_index] = true
    }
  }

  Get_Lives_cells_num(): number {
    if (this.Initial_amount_live_cells == Initial_amount_live_cells_options.Low) {
      return this.RandomInteger(1, (this.Board_size * this.Board_size) * 0.1)
    }
    if (this.Initial_amount_live_cells == Initial_amount_live_cells_options.Medium) {
      return this.RandomInteger((this.Board_size * this.Board_size) * 0.1, (this.Board_size * this.Board_size) * 0.3)
    }
    // if it's Large
    return this.RandomInteger((this.Board_size * this.Board_size) * 0.3, (this.Board_size * this.Board_size) * 0.5)
  }

  RandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  New_generation() {
    //Go over all cells
    //Send the index to Angel_of_death :)
    this.Is_stable_state = true;

    this.Board.map((row, Row_index) => {
      row.map((cell, Column_index) => {
        this.Angel_of_death(Row_index, Column_index);
      });
    })

    if (this.Is_stable_state) {
      this.Start_game();
    }

    if (this.Game_rules == Rules.spontaneous) {
      this.Chance_to_live();
    }
  }

  Chance_to_live() {
    this.Board.map((row, Row_index) => {
      row.map((cell, Column_index) => {
        if (!cell) {
          this.Board[Row_index][Column_index] = this.RandomInteger(0, 1) == 1 ? true : false;
        }
      })
    })
  }

  Angel_of_death(Row_index: number, Column_index: number) {
    //Go over all neighbors
    [
      [Row_index - 1, Column_index - 1],
      [Row_index + 1, Column_index + 1],
      [Row_index - 1, Column_index],
      [Row_index - 1, Column_index + 1],
      [Row_index, Column_index - 1],
      [Row_index, Column_index + 1],
      [Row_index + 1, Column_index - 1],
      [Row_index + 1, Column_index]
    ]
      .map((item, index) => {
        this.Check_neighbor(item[0], item[1])
      })

    const Max_neighbors = this.Game_rules == Rules.high_life ? 5 : 3;

    if (this.Board[Row_index][Column_index] == false) {// Is dead cell
      if (this.Lives_neighbors_count == 3) {
        this.Board[Row_index][Column_index] = true;
        this.Is_stable_state = false;
      }
    }
    else {//Is live cell
      if (this.Lives_neighbors_count < 2) {
        this.Board[Row_index][Column_index] = false;
        this.Is_stable_state = false;
      }
      else if (this.Lives_neighbors_count > Max_neighbors) {
        this.Board[Row_index][Column_index] = false;
        this.Is_stable_state = false;
      }
    }
    this.Lives_neighbors_count = 0;
  }



  Check_neighbor(Row_index: number, Column_index: number) {
    // for case that index of neighbor out of range
    if (Row_index > this.Board_size - 1 || Column_index > this.Board_size - 1 || Row_index < 0 || Column_index < 0) {
      return;
    }
    if (this.Board[Row_index][Column_index] == true) {
      this.Lives_neighbors_count++;
    }
  }

}

export enum Rules {
  original,
  high_life,
  spontaneous
}

export enum Initial_amount_live_cells_options {
  Low,
  Medium,
  Large
}
