import { Component, Output, EventEmitter, Input} from '@angular/core';

import { ProcedureTypes, IFunction, IModule, IProcedure } from '@models/procedure';
import { IFlowchart } from '@models/flowchart';
import * as CircularJSON from 'circular-json';
import { IArgument } from '@models/code';
import { ModuleAware, ModuleDocAware } from '@shared/decorators';
import { INode } from '@models/node';

import * as circularJSON from 'flatted';
import { DownloadUtils } from '@shared/components/file/download.utils';

const keys = Object.keys(ProcedureTypes);

@ModuleAware
@ModuleDocAware
@Component({
  selector: 'toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent {

    @Output() select = new EventEmitter();
    @Output() delete = new EventEmitter();
    @Output() imported = new EventEmitter();
    @Input() functions: IFunction[];
    @Input() node: INode;
    @Input() startProcedures: IProcedure[];

    ProcedureTypes = ProcedureTypes;
    ProcedureTypesArr = keys.slice(keys.length / 2);

    constructor() {}

    // add selected basic function as a new procedure
    add(type: ProcedureTypes): void {
        this.select.emit( { type: type, data: undefined } );
    }

    // add selected function from core.modules as a new procedure
    add_function(fnData) {
        // create a fresh copy of the params to avoid linked objects
        // todo: figure out
        fnData.args = fnData.args.map( (arg) => {
            return {name: arg.name, value: arg.value, default: arg.default};
            });

        this.select.emit( { type: ProcedureTypes.Function, data: fnData } );
    }

    // add selected imported function as a new procedure
    add_imported_function(fnData) {
        fnData.args = fnData.args.map( (arg) => {
            return {name: arg.name, value: arg.value, type: arg.type};
            });
        this.select.emit( { type: ProcedureTypes.Imported, data: fnData } );
    }

    // delete imported function
    delete_imported_function(fnData) {
        this.delete.emit(fnData);
    }


    // import a flowchart as function
    async import_function(event) {
        // read the file and create the function based on the flowchart
        const p = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function() {
                // parse the flowchart
                const fl = CircularJSON.parse(reader.result.toString()).flowchart;

                // create function and documentation of the function
                const funcs = [];
                const funcName = fl.name.replace(/\ /g, '_');
                const documentation = {
                    name: funcName,
                    module: 'Imported',
                    description: fl.description,
                    summary: fl.description,
                    parameters: [],
                    returns: undefined
                };
                const func: IFunction = <IFunction>{
                    flowchart: <IFlowchart>{
                        name: fl.name,
                        nodes: fl.nodes,
                        edges: fl.edges
                    },
                    name: funcName,
                    module: 'Imported',
                    doc: documentation,
                    importedFile: reader.result.toString()
                };

                func.args = [];
                for (const prod of fl.nodes[0].procedure) {
                    if (!prod.enabled) { continue; }

                    let v: string = prod.args[prod.argCount - 2].value || 'undefined';
                    if (v.substring(0, 1) === '"' || v.substring(0, 1) === '\'') { v = v.substring(1, v.length - 1); }
                    documentation.parameters.push({
                        name: v,
                        description: prod.meta.description
                    });
                    func.args.push(<IArgument>{
                        name: v,
                        default: prod.args[prod.argCount - 1].default,
                        value: undefined,
                        type: prod.meta.inputMode,
                    });
                }
                func.argCount = func.args.length;
                /*
                if (!func.argCount) {
                    resolve('error');
                }
                */

                // go through the nodes
                for (const node of fl.nodes) {
                    if (node.type === 'end') {
                        if (node.procedure.length > 0) {documentation.returns = node.procedure[0].meta.description; }
                    }
                }

                // add func and all the imported functions of the imported flowchart to funcs
                funcs.push(func);
                for (const i of fl.functions) {
                    funcs.push(i);
                }
                resolve(funcs);
            };
            reader.onerror = function() {
                resolve('error');
            };
            reader.readAsText(event.target.files[0]);
        });
        const fnc = await p;
        (<HTMLInputElement>document.getElementById('selectedFile')).value = '';
        if (fnc === 'error') {
            console.warn('Error reading file');
            return;
        }
        this.imported.emit(fnc);
    }

    downloadImported(event: MouseEvent, fnData) {
        event.stopPropagation();

        const fileString = fnData.importedFile;
        const fname = `${fnData.name}.mob`;
        const blob = new Blob([fileString], {type: 'application/json'});
        DownloadUtils.downloadFile(fname, blob);

    }

    toggleAccordion(id: string) {
        const acc = document.getElementById(id);
        // acc = document.getElementsByClassName("accordion");
        acc.classList.toggle('active');
        const panel = <HTMLElement>acc.nextElementSibling;
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
        }
    }

    checkBasicFunc(type) {
        const tp = type.toUpperCase();
        return tp !== 'FUNCTION'
        && tp !== 'IMPORTED'
        && tp !== 'CONSTANT'
        && tp !== 'RETURN'
        && tp !== 'ADDDATA'
        && tp !== 'BLANK';
    }

    checkInvalid(type) {
        const tp = type.toUpperCase();
        if (tp === 'ELSE') {
            if (!this.node.state.procedure[0]) {
                return true;
            }
            if (this.node.state.procedure[0].type.toString() !== ProcedureTypes.If.toString()
            && this.node.state.procedure[0].type.toString() !== ProcedureTypes.Elseif.toString()) {
                return true;
            }
            let prods: IProcedure[];

            if (this.node.state.procedure[0].parent) { prods = this.node.state.procedure[0].parent.children;
            } else { prods = this.node.procedure; }

            for (let i = 0 ; i < prods.length - 1; i++) {
                if (prods[i].ID === this.node.state.procedure[0].ID) {
                    if (prods[i + 1].type.toString() !== ProcedureTypes.Elseif.toString() ||
                    prods[i + 1].type.toString() !== ProcedureTypes.Else.toString()) {
                        return true;
                    }
                }
            }
            return false;
        } else if (tp === 'ELSEIF') {
            if (!this.node.state.procedure[0]) {
                return true;
            }
            return (this.node.state.procedure[0].type.toString() !== ProcedureTypes.If.toString()
            && this.node.state.procedure[0].type.toString() !== ProcedureTypes.Elseif.toString());
        } else if (tp === 'BREAK' || tp === 'CONTINUE') {
            let checkNode = this.node.state.procedure[0];
            if (!checkNode) { return true; }
            while (checkNode.parent) {
                if (checkNode.parent.type.toString() === ProcedureTypes.Foreach.toString() ||
                checkNode.parent.type.toString() === ProcedureTypes.While.toString()) {
                    return false;
                }
                checkNode = checkNode.parent;
            }
            return true;
        }
        return false;
    }

}
