import numpy as np

n_decimals = 3

#################################### quality measures ####################################


def accuracy_consistency_understandability(df, n_row, n_col, n_line):
    if n_row * n_col == 0:
        return 0, 0, 0, 0, 0, 0

    n_total_elements = n_row * n_col

    # accuracy
    n_outliers_per_col = []
    n_measured_elements_acc = 0

    # consistency
    n_non_consistent = 0
    n_measured_elements_con = 0
    columns_list = []
    single_duplications = []

    # understandability
    n_values_with_unk_symbol = 0

    for i in range(0, n_col):
        value_list = df.iloc[:, i].tolist()

        # Acc-I-4
        cleaned_list = []
        for x in value_list:
            val = str(x)

            # Und-I-1
            if "�" in val:  # the character assigned during decoding if it fails
                n_values_with_unk_symbol += 1

            if val != "nan":  # skip nan values
                new_val = val.replace(",", ".")
                try:  # add only numeric values
                    float_val = float(new_val)
                    cleaned_list.append(float_val)
                except:
                    pass
        if len(cleaned_list) > 4:  # we need at least 5 elements to talk about outliers
            n_outliers = iqr(np.array(cleaned_list))
            if n_outliers == len(cleaned_list):  # all the numbers are outliers
                n_outliers_per_col.append(0)
            else:  # optimal case, there are true outliers
                n_measured_elements_acc += len(cleaned_list)
                n_outliers_per_col.append(n_outliers)
        else:
            n_outliers_per_col.append(0)

        # Con-I-2
        type_list = [
            str(x).replace(".", "").replace(",", "").isdigit()
            for x in value_list
            if str(x) != "nan"
        ]  # calculate type as numeric or string
        n_numeric = sum(type_list)  # numeric = True
        n_string = len(type_list) - n_numeric

        # the type that is the min is the inconsistent one
        # if all values are of the same type, the other type is 0 so min = 0
        n_measured_elements_con += len(type_list)
        n_non_consistent += min(n_numeric, n_string)

        # Con-I-3
        # need this for the second computation --> [[value_list1],[value_list2],..]
        columns_list.append(value_list)
        duplicates = count_duplicates(value_list)
        single_duplications.append(duplicates)

    # need to have some numeric values to measure accuracy
    AccI3 = (
        round(n_measured_elements_acc / n_total_elements, n_decimals)
        if n_total_elements != 0
        else 0
    )
    AccI4 = (
        round(1 - sum(n_outliers_per_col) / n_measured_elements_acc, n_decimals)
        if n_measured_elements_acc != 0
        else 0
    )

    ConI2 = (
        round(1 - n_non_consistent / n_measured_elements_con, n_decimals)
        if n_measured_elements_con != 0
        else 0
    )

    tot_possible_dup = n_row * (n_col + (n_col * (n_col - 1) / 2))
    tot_single_dup = sum(single_duplications)
    tot_pair_dup = count_duplicates_column_pairs(columns_list)
    ConI3 = (
        round(
            1 - (tot_single_dup + tot_pair_dup) / tot_possible_dup,
            n_decimals,
        )
        if tot_possible_dup != 0
        else 0
    )

    # number of the rows of the dataframe i.e. rows having the right structure
    # number of lines of the file i.e. total number of rows including irregular ones
    ConI4 = round(
        n_row / n_line,
        n_decimals,
    )

    ConI5 = 1  # coverage of consistency of data values
    # always 1 since ConI3 measures consistency of data values for all the data items

    UndI1 = round(
        1 - n_values_with_unk_symbol / (n_row * n_col),
        n_decimals,
    )

    return AccI3, AccI4, ConI2, ConI3, ConI4, ConI5, UndI1


def availability_completeness(df, n_row, n_col, num_available, num_accesses):

    AvaD1 = round(num_available / num_accesses, n_decimals) if num_accesses != 0 else 0

    n_notna_cells = df.notna().sum().sum()
    ComI1 = (
        round(n_notna_cells / (n_row * n_col), n_decimals) if n_row * n_col != 0 else 0
    )

    n_na_rows = df.isnull().all(1).sum()
    ComI5 = round(1 - n_na_rows / n_row, n_decimals) if n_row * n_col != 0 else 0

    return AvaD1, ComI1, ComI5


#################################### auxiliary functions ####################################


def iqr(data):
    n_outliers = 0
    q1 = np.percentile(data, 25)
    q3 = np.percentile(data, 75)
    IQR = q3 - q1
    min = q1 - 1.5 * IQR
    max = q3 + 1.5 * IQR
    for el in data:
        if el > max or el < min:
            n_outliers += 1
    return n_outliers


def count_duplicates(col_list):
    col_set = set(col_list)
    element_count = [col_list.count(element) for element in col_set]
    duplicates = [x for x in element_count if x > 1]
    return sum(duplicates)


def count_duplicates_column_pairs(all_columns_list):
    total_pair_duplicates = 0
    for i in range(0, len(all_columns_list) - 1):
        for j in range(i + 1, len(all_columns_list)):
            first_col = all_columns_list[i]  # column1
            second_col = all_columns_list[j]  # column2
            pair_col = []  # column1+column2
            for a in range(0, len(first_col)):  # form the pairs
                new_el = str(first_col[a]) + str(second_col[a])
                pair_col.append(new_el)
            duplicates = count_duplicates(pair_col)  # count pair duplicates
            total_pair_duplicates += duplicates
    return total_pair_duplicates
