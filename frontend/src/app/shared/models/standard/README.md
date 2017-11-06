======
## HOW TO CREATE MODELS.
======

======
### SIMPLE MODELS.
======

1. Every model inherits from Model in model.model.ts in one way or another.
2. A simple example of a model is:

    export class BasicModel extends Model {
        /**
        * These are the db fields, they define the model.
        */
        name: string = "";    // Name
        surname: string = ""; // Surname
        id: number = null;    // ID

        contructor(data?) {
            super();

            this.dbFields = ["name", "surname", "id"]; // This is very important, this tells the .update that fields define this model.
            this.update(data);
        }
    }

3. The above example demonstrates the basic's of every model. In the constructor you need to call super() first to implement all the parent functions and properties. The the second thing that is very important is you need to define the dbFields in the constructor and ensure those variables (properties) are present at the top of the class (There where name, surname and id are defined, those are the model fields). DB Fields define the whole model. The this.dbFields are used in the .update function to know which fields to update and map to the model.

======
### ADVANCE MODELS.
======
1. Same as above.
2. A example of an advance model is.

    export class BasicModel extends Model {
        /**
        * These are the db fields, they define the model.
        */
        name: string = "";        // Name
        surname: string = "";     // Surname
        id: number = null;        // ID
        data: Data = new Data();  // Some extra data   

        contructor(data?) {
            super();

            this.dbFields = ["name", "surname", "id", "data"]; // This is very important, this tells the .update that fields define this model.
            this.modelFields = {   // This is very important if you have models within models.
                data: Data
            }
            this.update(data);
        }
    }

    export class Data extends Model {
        /**
        * These are the db fields, they define the model.
        */
        address: string = "";        // Name
        telephone: string = "";     // Surname

        contructor(data?) {
            super();

            this.dbFields = ["address", "telephone"]; // This is very important, this tells the .update that fields define this model.
            this.update(data);
        }
    }

3. The above example is basically the same as a simple model except that you have models within models. You define these in the modelFields property. It is basically a dictionary with the name of the field as the key and the datatype of the field as the value, thats basically it, the rest will be sorted out by the update.

======
### MODEL FUNCTIONS
======
let person = new BasicModel({
    name: Wilco,
    surname: Breedt,
    id: 10
    data: { telephone: "0826042956",
            address: "273 Kruger Avenue, Lyttelton, Centurion" 
    }
});

##### UPDATING
1. You can update the model by accessing the field directly.
person.name = "Jannie";
2. You can update the model using a dictionary.
person.update({name: "Jannie"})
3. Some more documentation needs to be done here, don't have the time right now.

##### SOME BASICs
1. Use the .serverPost() to do backend calls, just read in the documentation within the model about this.
2. There are several updating strategies to use for checking if the model is dirty (Has Changed since the last time). These are .tempUpdate() and .update() . Check the project for examples of this.
3. You can clear the whole model to it's standard state using .clearFields()
4. You can restore your model after making it dirty using .restoreFromBeforeSnapshot() and restoreFromSnapshot() read the documentation within the model to make sure what they do.
5. You can get a string representation of the model using .toString()
6. You can get a dictionary representation of the model by using .values()
