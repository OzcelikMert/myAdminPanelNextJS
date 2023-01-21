import React, {Component} from "react";

function setDataWithKeys(data: any, keys: string[], value: any, isArrayPush: boolean = false) {
    let key = keys[0];

    if (keys.length === 1){
        if(isArrayPush){
            if(Array.isArray(data[key])){
                data[key].push(value)
            }else {
                data[key] = [value];
            }
        }else {
            data[key] = value;
        }
    }else{
        if(typeof data[key] === "undefined"){
            data[key] = {};
        }

        data[key] = setDataWithKeys(data[key], keys.slice(1), value);
    }

    return data;
}

class HandleForm {
    static onChangeInput(event: React.ChangeEvent<any>, component: Component) {
        component.setState((state: any) => {
            let value: any = null;
            if(event.target.type === "checkbox") {
                value = event.target.checked ? 1 : 0;
            }else{
                value = event.target.value;
            }
            state = setDataWithKeys(state, event.target.name.split("."), value);
            return state;
        })
    }

    static onChangeSelect(key: any, value: any, component: Component) {
        component.setState((state: any) => {
            if(Array.isArray(value)){
                state = setDataWithKeys(state, key.split("."), []);
                value.forEach(item => {
                    let data = (typeof item.value !== "undefined") ? item.value : item;
                    state = setDataWithKeys(state, key.split("."), data, true);
                })
            }else {
                state = setDataWithKeys(state, key.split("."), value);
            }
            return state;
        });
    }
}

export default HandleForm;