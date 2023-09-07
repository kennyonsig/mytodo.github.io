import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, map, Observable } from 'rxjs';
import { IList } from '../interface/IList';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  lists$ = new BehaviorSubject<IList[]>([]);
  readonly listDate = new Date();
  listDeadLine = new Date();

  constructor() {
    const savedLists = localStorage.getItem('lists');
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      this.lists$.next(parsedLists);
    } //что-то типо временной БД
  }

  getLists(): IList[] {
    return this.lists$.getValue();
  }

  updateLists(updatedLists: IList[]) {
    this.lists$.next(updatedLists);
    localStorage.setItem('lists', JSON.stringify(updatedLists));
  }

  updListInfo(updListInfo: IList) {
    const updatedListsArr: IList[] = this.getLists().map((currentListInfo: IList) =>
      currentListInfo.listNumber === updListInfo.listNumber
        ? updListInfo
        : currentListInfo
    );

    this.updateLists(updatedListsArr);
  }

  addNewList() {
    const currentListLength = this.getLists().length;
    const newList: IList = {
      listDate: this.listDate,
      listDeadLine: this.listDeadLine,
      listName: 'ToDo' + `#${currentListLength + 1}`,
      listNumber: currentListLength + 1,
      tasksArr: [],
      isListEdit: true,
      isListExpand: false,
      isListSelected: false,
    };
    const updatedListsArr: IList[] = [...this.getLists(), newList];

    this.updateLists(updatedListsArr);
  }

  duplicateList(selectedDupListNumber: number) {
    const selectedList = this.getLists().find(list => list.listNumber === selectedDupListNumber);

    if (selectedList) {
      const dupList: IList = {
        ...selectedList,
        tasksArr: selectedList.tasksArr.map(task => ({
          ...task,
          isTaskInListNumber: this.getLists().length + 1
        })),
        listNumber: this.getLists().length + 1,
      };
      const updatedListsArr = [...this.getLists(), dupList];

      this.updateLists(updatedListsArr);
    }
  }

  deleteList(selectedDelListNumber: number) {
    const updatedListsArr: IList[] = this.getLists()
      .filter((list: IList): boolean => list.listNumber !== selectedDelListNumber)
      .map((list: IList, index: number) => ({...list, listNumber: index + 1}));

    this.updateLists(updatedListsArr);
  }

  deleteAllList() {
    this.lists$.next([]);
    localStorage.removeItem('lists');
  }

  isListSelected(selectedListNumber: number): boolean {
    return this.getLists()
      .some((list: IList): boolean => list.listNumber === selectedListNumber);
  }

  clearList(selectedClearListNumber: number) {
    const selectedList = this.getLists()
      .find(list => list.listNumber === selectedClearListNumber);
    if (selectedList) {
      selectedList.tasksArr = [];

      const updatedListsArr = [...this.getLists()];
      this.updateLists(updatedListsArr);
    }
  }

  findList(value: string): Observable<IList[]> {
    return this.lists$.pipe(
      map(lists => {
        return lists.filter(list => list.listName.toLowerCase().includes(value.toLowerCase()));
      }),
      debounceTime(500)
    );
  }
}
