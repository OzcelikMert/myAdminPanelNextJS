import React, {Component, ComponentState} from "react";

class HandleForm {
    static onChangeInput(event: React.ChangeEvent<any>, component: Component) {
        component.setState((state: any) => {
            let value: any = null;
            if(event.target.type === "checkbox") {
                value = event.target.checked ? 1 : 0;
            }else{
                value = event.target.value;
            }
            eval(`state.formData${event.target.name.split(".").map((name: any) => `['${name}']`).join("")} = value`);
            return state;
        })
    }

    static onChangeSelect(key: any, value: any, component: Component) {
        component.setState((state: any) => {
            if(Array.isArray(value)){
                eval(`state.formData${key.split(".").map((name: any) => `['${name}']`).join("")}=[]`);
                value.forEach(item => {
                    let data = (typeof item.value !== "undefined") ? item.value : item;
                    eval(`state.formData${key.split(".").map((name: any) => `['${name}']`).join("")}.push(data)`);
                })
            }else {
                eval(`state.formData${key.split(".").map((name: any) => `['${name}']`).join("")} = value`);
            }
            return state;
        });
    }
}

export default HandleForm;